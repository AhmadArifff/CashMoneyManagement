<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Services\ExpenseService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(protected ExpenseService $expenseService)
    {
    }

    public function index(Request $request)
    {
        $start = $request->query('start', now()->startOfMonth()->toDateString());
        $end = $request->query('end', now()->endOfMonth()->toDateString());
        $filters = ['category' => $request->query('category')];

        $expenses = $this->expenseService->list($request->user()->id, $start, $end, $filters);

        return ExpenseResource::collection($expenses);
    }

    public function store(StoreExpenseRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            $disk = config('filesystems.default', 'public');
            $data['attachment_path'] = $request->file('attachment')->store('receipts', $disk);
        }

        $expense = $this->expenseService->store($request->user()->id, $data);

        return (new ExpenseResource($expense))->response()->setStatusCode(201);
    }

    public function update(StoreExpenseRequest $request, int $id)
    {
        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            $disk = config('filesystems.default', 'public');
            $data['attachment_path'] = $request->file('attachment')->store('receipts', $disk);
        }

        return new ExpenseResource($this->expenseService->update($request->user()->id, $id, $data));
    }

    public function destroy(Request $request, int $id)
    {
        return response()->json(['deleted' => $this->expenseService->delete($request->user()->id, $id)]);
    }

    public function markPaid(Request $request, int $id)
    {
        return new ExpenseResource($this->expenseService->markPaid($request->user()->id, $id));
    }
}
