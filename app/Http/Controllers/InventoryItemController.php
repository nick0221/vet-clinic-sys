<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInventoryItemRequest;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryItemController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('inventory.view-any');

        $query = InventoryItem::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('supplier', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === '1');
        }

        $items = $query->latest()->paginate(10);

        return Inertia::render('inventory/index', [
            'items' => $items,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function store(StoreInventoryItemRequest $request)
    {
        $this->authorize('inventory.create');

        InventoryItem::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Item created successfully.']);

        return redirect()->back();
    }

    public function show(InventoryItem $inventoryItem)
    {
        $this->authorize('inventory.view');

        return Inertia::render('inventory/show', [
            'item' => $inventoryItem->loadMissing('activity'),
        ]);
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem)
    {
        $this->authorize('inventory.update');

        $inventoryItem->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Item updated successfully.']);

        return redirect()->back();
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $this->authorize('inventory.delete');

        $inventoryItem->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Item deleted successfully.']);

        return redirect()->back();
    }

    public function restore($id)
    {
        $this->authorize('inventory.restore');

        $item = InventoryItem::withTrashed()->findOrFail($id);
        $item->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Item restored successfully.']);

        return redirect()->back();
    }
}
