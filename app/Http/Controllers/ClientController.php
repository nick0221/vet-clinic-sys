<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('clients.view-any');

        $query = Client::withCount('pets')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $clients = $query->paginate(10);

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $this->authorize('clients.create');

        Client::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Client created successfully.']);

        return to_route('clients.index');
    }

    public function show(Client $client): Response
    {
        $this->authorize('clients.view');

        $client->load('pets');
        $client->loadCount('pets');

        return Inertia::render('clients/show', [
            'client' => $client,
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $this->authorize('clients.update');

        $client->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Client updated successfully.']);

        return to_route('clients.index');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $this->authorize('clients.delete');

        $client->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Client deleted successfully.']);

        return to_route('clients.index');
    }

    public function restore($id): RedirectResponse
    {
        $this->authorize('clients.restore');

        $client = Client::withTrashed()->findOrFail($id);
        $client->restore();

        return redirect()->back();
    }
}
