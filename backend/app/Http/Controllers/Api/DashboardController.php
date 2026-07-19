<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboardService)
    {
    }

    public function summary(Request $request)
    {
        $start = $request->query('start', now()->startOfMonth()->toDateString());
        $end = $request->query('end', now()->endOfMonth()->toDateString());

        return $this->dashboardService->summary($request->user()->id, $start, $end);
    }

    public function unpaidBills(Request $request)
    {
        return $this->dashboardService->unpaidBills($request->user()->id);
    }
}
