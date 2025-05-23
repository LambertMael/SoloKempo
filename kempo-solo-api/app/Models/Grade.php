<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grade extends Model
{
    use HasFactory;

    protected $table = 'grade';

    protected $fillable = [
        'nom',
        'couleur_ceinture'
    ];

    public function competiteurs(): HasMany
    {
        return $this->hasMany(Competiteur::class, 'id_grade');
    }
}