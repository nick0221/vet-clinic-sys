<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\LabRequest;
use App\Models\LabTest;
use App\Models\MedicalRecord;
use App\Models\Pet;
use App\Models\Prescription;
use App\Models\Surgery;
use App\Models\Vaccination;
use App\Observers\ActivityObserver;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerObservers();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function registerObservers(): void
    {
        $models = [
            Client::class,
            Pet::class,
            Appointment::class,
            MedicalRecord::class,
            Vaccination::class,
            Prescription::class,
            Invoice::class,
            InventoryItem::class,
            LabTest::class,
            LabRequest::class,
            Surgery::class,
        ];

        foreach ($models as $model) {
            $model::observe(ActivityObserver::class);
        }
    }
}
