<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\LeaveRequest;

class LeaveStatusNotification extends Notification
{
    use Queueable;

    public $leaveRequest;

    public function __construct(LeaveRequest $leaveRequest)
    {
        $this->leaveRequest = $leaveRequest;
    }

    public function via($notifiable)
    {
        return ['database']; 
    }

    public function toArray($notifiable)
    {
        $statusText = $this->leaveRequest->status === 'approved' ? 'approuvée' : ($this->leaveRequest->status === 'rejected' ? 'refusée' : 'mise à jour');

        return [
            'title' => 'Mise à jour de congé',
            'message' => "Votre demande de congé du {$this->leaveRequest->start_date} au {$this->leaveRequest->end_date} a été {$statusText}.",
            'leave_request_id' => $this->leaveRequest->id,
            'status' => $this->leaveRequest->status
        ];
    }
}
