<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIncomeRequest;
use App\Http\Resources\IncomeResource;
use App\Services\IncomeService;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function __construct(protected IncomeService $incomeService)
    {
    }

    public function index(Request $request)
    {
        $start = $request->query('start', now()->startOfMonth()->toDateString());
        $end = $request->query('end', now()->endOfMonth()->toDateString());
        $filters = ['category' => $request->query('category')];

        $incomes = $this->incomeService->list($request->user()->id, $start, $end, $filters);

        return IncomeResource::collection($incomes);
    }

    public function store(StoreIncomeRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            $disk = config('filesystems.default', 'public');
            $data['attachment_path'] = $request->file('attachment')->store('receipts', $disk);
        }

        $income = $this->incomeService->store($request->user()->id, $data);

        return (new IncomeResource($income))->response()->setStatusCode(201);
    }

    public function update(StoreIncomeRequest $request, int $id)
    {
        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            $disk = config('filesystems.default', 'public');
            $data['attachment_path'] = $request->file('attachment')->store('receipts', $disk);
        }

        $income = $this->incomeService->update($request->user()->id, $id, $data);

        return new IncomeResource($income);
    }

    public function destroy(Request $request, int $id)
    {
        return response()->json(['deleted' => $this->incomeService->delete($request->user()->id, $id)]);
    }
}
