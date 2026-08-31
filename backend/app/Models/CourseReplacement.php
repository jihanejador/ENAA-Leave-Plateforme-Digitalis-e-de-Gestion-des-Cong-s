<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseReplacement extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_request_id',
        'replacement_user_id',
        'course_module',
        'affected_date',
        'proposed_catchup_date',
        'status',
    ];

    protected $casts = [
        'affected_date' => 'date',
        'proposed_catchup_date' => 'date',
    ];

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }

    public function replacementUser()
    {
        return $this->belongsTo(User::class, 'replacement_user_id');
    }
}
