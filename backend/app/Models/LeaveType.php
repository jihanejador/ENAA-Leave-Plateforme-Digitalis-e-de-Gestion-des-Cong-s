<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'default_quota',
        'requires_proof',
        'requires_replacement',
    ];

    protected $casts = [
        'default_quota' => 'float',
        'requires_proof' => 'boolean',
        'requires_replacement' => 'boolean',
    ];

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
