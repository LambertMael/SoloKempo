<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pays extends Model
{
    use HasFactory;

    protected $table = 'pays';

    protected $fillable = [
        'nom',
        'nom_abrev',
        'drapeau_emoji'
    ];

    public function competiteurs(): HasMany
    {
        return $this->hasMany(Competiteur::class, 'id_pays');
    }
}