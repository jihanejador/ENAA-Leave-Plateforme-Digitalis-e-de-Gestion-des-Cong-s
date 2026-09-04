<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeaveStatusNotification extends Notification
{
    use Queueable;

    protected $leaveRequest;

    public function __construct($leaveRequest)
    {
        $this->leaveRequest = $leaveRequest;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $statusText = match($this->leaveRequest->status) {
            'pending_hr' => 'approuvée par le manager (en attente RH)',
            'approved' => 'validée définitivement',
            'rejected' => 'refusée',
            default => $this->leaveRequest->status,
        };

        return [
            'leave_request_id' => $this->leaveRequest->id,
            'status' => $this->leaveRequest->status,
            'message' => "Votre demande de congé a été {$statusText}.",
        ];
    }
}
