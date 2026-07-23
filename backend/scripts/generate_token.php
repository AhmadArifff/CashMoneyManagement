<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'test@example.com')->first();
if (! $user) {
    echo "NOUSER\n";
    exit(1);
}

$token = $user->createToken('cli')->plainTextToken;
echo $token . PHP_EOL;
