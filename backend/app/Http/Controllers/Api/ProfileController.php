<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Services\ProfileService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(protected ProfileService $profileService)
    {
    }

    public function show(Request $request)
    {
        return new ProfileResource($this->profileService->getForUser($request->user()->id));
    }

    public function update(UpdateProfileRequest $request)
    {
        return new ProfileResource($this->profileService->update($request->user()->id, $request->validated()));
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate(['avatar' => ['required', 'image', 'max:2048']]);

        $path = $request->file('avatar')->store('avatars', 'public');

        return $this->profileService->update($request->user()->id, ['avatar_path' => $path]);
    }
}
