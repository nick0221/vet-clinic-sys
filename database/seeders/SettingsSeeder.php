<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::set('site_name', 'Vet Clinic');
        Setting::set('site_description', 'Professional veterinary care for your beloved pets');
        Setting::set('site_tagline', 'Caring for your pets like family');
        Setting::set('address', '');
        Setting::set('phone', '');
        Setting::set('email', '');
        Setting::set('brand_logo', '');
        Setting::set('business_hours', 'Mon–Fri 8:00 AM – 6:00 PM, Sat 9:00 AM – 2:00 PM');
    }
}
