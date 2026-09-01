<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\CourseReplacement;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_half_day' => 'boolean',
            'reason' => 'nullable|string',
            'proof' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            'replacements' => 'nullable|array',
            'replacements.*.replacement_user_id' => 'required|exists:users,id',
            'replacements.*.course_module' => 'required|string',
            'replacements.*.affected_date' => 'required|date',
        ]);

        $user = $request->user();

        $start = new \DateTime($validated['start_date']);
        $end = new \DateTime($validated['end_date']);
        $days = $start->diff($end)->days + 1;
        if ($request->is_half_day) $days = 0.5;

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('proofs', 'public');
        }

        $leaveRequest = LeaveRequest::create([
            'user_id' => $user->id,
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'is_half_day' => $validated['is_half_day'] ?? false,
            'calculated_days' => $days,
            'reason' => $validated['reason'] ?? null,
            'proof_path' => $proofPath,
            'status' => 'pending_manager',
        ]);

        if ($user->is_trainer && !empty($validated['replacements'])) {
            foreach ($validated['replacements'] as $rep) {
                CourseReplacement::create([
                    'leave_request_id' => $leaveRequest->id,
                    'replacement_user_id' => $rep['replacement_user_id'],
                    'course_module' => $rep['course_module'],
                    'affected_date' => $rep['affected_date'],
                ]);
            }
        }

        return response()->json([
            'message' => 'Demande de congé créée avec succès',
            'leave_request' => $leaveRequest->load('courseReplacements')
        ], 201);
    }

    public function index(Request $request)
    {
        return response()->json(
            LeaveRequest::with(['leaveType', 'courseReplacements.replacementUser'])
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get()
        );
    }
}
