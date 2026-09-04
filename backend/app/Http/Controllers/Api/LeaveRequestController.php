<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use App\Models\CourseReplacement;
use App\Notifications\LeaveStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LeaveRequestController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'leave_type_id' => 'required|exists:leave_types,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'reason' => 'nullable|string',
                'replacement_user_id' => 'nullable|exists:users,id',
                'course_module' => 'nullable|string',
                'proposed_catchup_date' => 'nullable|date',
                'proof' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            ]);

            $user = $request->user();

            $start = new \DateTime($request->start_date);
            $end = new \DateTime($request->end_date);
            $days = $start->diff($end)->days + 1;

            $isHalfDay = filter_var($request->is_half_day, FILTER_VALIDATE_BOOLEAN);

            if ($isHalfDay) {
                $days = 0.5;
            }

            $proofPath = null;
            if ($request->hasFile('proof')) {
                $proofPath = $request->file('proof')->store('proofs', 'public');
            }

            $leaveRequest = LeaveRequest::create([
                'user_id' => $user->id,
                'leave_type_id' => (int) $request->leave_type_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_half_day' => $isHalfDay ? 1 : 0,
                'calculated_days' => $days,
                'reason' => $request->reason,
                'proof_path' => $proofPath,
                'status' => 'pending_manager',
            ]);

            if ($request->filled('replacement_user_id')) {
                CourseReplacement::create([
                    'leave_request_id' => $leaveRequest->id,
                    'replacement_user_id' => (int) $request->replacement_user_id,
                    'course_module' => $request->course_module ?? 'Module Général',
                    'affected_date' => $request->start_date,
                    'proposed_catchup_date' => $request->proposed_catchup_date,
                    'status' => 'pending',
                ]);
            }

            return response()->json([
                'message' => 'Demande envoyée avec succès',
                'leave_request' => $leaveRequest->load('courseReplacements')
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur Serveur: ' . $e->getMessage()
            ], 500);
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

    public function pendingForManager(Request $request)
    {
        return response()->json(
            LeaveRequest::with(['user', 'leaveType', 'courseReplacements.replacementUser'])
                ->where('status', 'pending_manager')
                ->latest()
                ->get()
        );
    }

    public function managerApprove(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        $leaveRequest = LeaveRequest::findOrFail($id);

        if ($request->status === 'rejected') {
            $leaveRequest->status = 'rejected';
            $leaveRequest->rejection_reason = $request->rejection_reason;
        } else {
            $leaveRequest->status = 'pending_hr';
        }

        $leaveRequest->save();

        $leaveRequest->user->notify(new LeaveStatusNotification($leaveRequest));

        return response()->json([
            'message' => 'Demande traitée par le manager avec succès',
            'leave_request' => $leaveRequest
        ]);
    }

    public function pendingForHR(Request $request)
    {
        return response()->json(
            LeaveRequest::with(['user', 'leaveType', 'courseReplacements.replacementUser'])
                ->where('status', 'pending_hr')
                ->latest()
                ->get()
        );
    }

    public function hrApprove(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        $leaveRequest = LeaveRequest::findOrFail($id);
        $leaveRequest->status = $request->status;

        if ($request->status === 'rejected') {
            $leaveRequest->rejection_reason = $request->rejection_reason;
        }

        $leaveRequest->save();

        if ($request->status === 'approved') {
            $balance = LeaveBalance::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->first();

            if ($balance) {
                $balance->used_days += $leaveRequest->calculated_days;
                $balance->remaining_days = max(0, $balance->allocated_days - $balance->used_days);
                $balance->save();
            }
        }

        $leaveRequest->user->notify(new LeaveStatusNotification($leaveRequest));

        return response()->json([
            'message' => 'Demande validée définitivement par le RH',
            'leave_request' => $leaveRequest
        ]);
    }
}
