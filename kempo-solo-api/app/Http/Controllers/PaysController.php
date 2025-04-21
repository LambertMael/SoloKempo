<?php

namespace App\Http\Controllers;

use App\Models\Pays;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaysController extends Controller
{
    public function index()
    {
        return response()->json(Pays::all());
    }

    public function show($id)
    {
        $pays = Pays::findOrFail($id);
        return response()->json($pays);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'nom_abrev' => 'nullable|string|max:10',
            'drapeau_emoji' => 'nullable|string|max:10'
        ]);

        $pays = Pays::create($validated);
        return response()->json($pays, Response::HTTP_CREATED);
    }

    public function update(Request $request, $id)
    {
        $pays = Pays::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'nom_abrev' => 'nullable|string|max:10',
            'drapeau_emoji' => 'nullable|string|max:10'
        ]);

        $pays->update($validated);
        return response()->json($pays);
    }

    public function destroy($id)
    {
        $pays = Pays::findOrFail($id);
        $pays->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}