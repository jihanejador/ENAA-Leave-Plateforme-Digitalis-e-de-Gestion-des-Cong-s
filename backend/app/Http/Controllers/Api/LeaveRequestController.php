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
        try {
            $validated = $request->validate([
                'leave_type_id' => 'required',
                'start_date' => 'required|date',
                'end_date' => 'required|date',
                'reason' => 'nullable|string',
            ]);

            $user = $request->user();

            // حساب الأيام
            $start = new \DateTime($request->start_date);
            $end = new \DateTime($request->end_date);
            $days = $start->diff($end)->days + 1;

            if ($request->has('is_half_day') && $request->is_half_day == '1') {
                $days = 0.5;
            }

            // حفظ الفايل إلا كان
            $proofPath = null;
            if ($request->hasFile('proof')) {
                $proofPath = $request->file('proof')->store('proofs', 'public');
            }

            $leaveRequest = LeaveRequest::create([
                'user_id' => $user->id,
                'leave_type_id' => (int) $request->leave_type_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_half_day' => $request->is_half_day == '1' ? true : false,
                'calculated_days' => $days,
                'reason' => $request->reason,
                'proof_path' => $proofPath,
                'status' => 'pending_manager',
            ]);

            return response()->json([
                'message' => 'Demande envoyée avec succès',
                'leave_request' => $leaveRequest
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
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
