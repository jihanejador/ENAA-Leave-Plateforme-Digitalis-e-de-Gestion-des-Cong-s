<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Créer les Types de Congés
        $annual = LeaveType::create([
            'name' => 'Congé Payé',
            'default_quota' => 22,
            'requires_proof' => false,
            'requires_replacement' => false
        ]);

        $sick = LeaveType::create([
            'name' => 'Maladie',
            'default_quota' => 10,
            'requires_proof' => true,
            'requires_replacement' => false
        ]);

        $authorized = LeaveType::create([
            'name' => 'Autorisation d\'absence',
            'default_quota' => 5,
            'requires_proof' => false,
            'requires_replacement' => true
        ]);

        // 2. Créer Manager
        $manager = User::create([
            'name' => 'Manager Test',
            'email' => 'manager@enaa.ma',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'is_trainer' => false,
        ]);

        // 3. Créer Formateur / Employé
        $employee = User::create([
            'name' => 'Jihane Employee',
            'email' => 'employee@enaa.ma',
            'password' => Hash::make('password'),
            'manager_id' => $manager->id,
            'is_trainer' => true,
            'role' => 'employee',
        ]);

        // 4. Créer les Soldes pour l'employé (US 1.2)
        LeaveBalance::create([
            'user_id' => $employee->id,
            'leave_type_id' => $annual->id,
            'allocated_days' => 22,
            'used_days' => 4,
            'remaining_days' => 18,
        ]);

        LeaveBalance::create([
            'user_id' => $employee->id,
            'leave_type_id' => $sick->id,
            'allocated_days' => 10,
            'used_days' => 0,
            'remaining_days' => 10,
        ]);
    }
}
