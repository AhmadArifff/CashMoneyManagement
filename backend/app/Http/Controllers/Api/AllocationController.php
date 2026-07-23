<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAllocationRequest;
use App\Http\Resources\AllocationResource;
use App\Services\AllocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AllocationController extends Controller
{
    public function __construct(protected AllocationService $allocationService)
    {
    }

    public function index(Request $request)
    {
        $start = $request->query('start', now()->startOfMonth()->toDateString());
        $end = $request->query('end', now()->endOfMonth()->toDateString());
        $filters = ['category' => $request->query('category')];

        $allocations = $this->allocationService->list($request->user()->id, $start, $end, $filters);

        return AllocationResource::collection($allocations);
    }

    public function store(StoreAllocationRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('receipts', 'supabase');
        }

        $allocation = $this->allocationService->store($request->user()->id, $data);

        return (new AllocationResource($allocation))->response()->setStatusCode(201);
    }

    public function update(StoreAllocationRequest $request, int $id)
    {
        $data = $request->validated();
        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('receipts', 'supabase');
        }

        $allocation = $this->allocationService->update($request->user()->id, $id, $data);

        return new AllocationResource($allocation);
    }

    public function destroy(Request $request, int $id)
    {
        return response()->json(['deleted' => $this->allocationService->delete($request->user()->id, $id)]);
    }
}
