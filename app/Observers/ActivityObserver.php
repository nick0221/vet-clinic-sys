<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityObserver
{
    public function created(Model $model): void
    {
        $this->log('created', $model);
    }

    public function updated(Model $model): void
    {
        if ($model->isDirty() && ! $model->wasRecentlyCreated) {
            $this->log('updated', $model, [
                'old' => $model->getOriginal(),
                'new' => $model->getDirty(),
            ]);
        }
    }

    public function deleted(Model $model): void
    {
        if ($model->isForceDeleting()) {
            return;
        }

        $this->log('deleted', $model);
    }

    public function restored(Model $model): void
    {
        $this->log('restored', $model);
    }

    private function log(string $action, Model $model, ?array $properties = null): void
    {
        if (! Auth::check()) {
            return;
        }

        $model->activity()->create([
            'user_id' => Auth::id(),
            'action' => $action,
            'properties' => $properties ?? $model->getDirty(),
        ]);
    }
}
