<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Combat extends Model
{
    use HasFactory;

    protected $table = 'combat';

    protected $fillable = [
        'id_p1',
        'id_p2',
        'penalite_p1',
        'penalite_p2',
        'score_p1',
        'score_p2',
        'duree',
        'id_poule'
    ];

    protected $casts = [
        'penalite_p1' => 'integer',
        'penalite_p2' => 'integer',
        'score_p1' => 'integer',
        'score_p2' => 'integer',
        'duree' => 'integer'
    ];

    public function poule(): BelongsTo
    {
        return $this->belongsTo(Poule::class, 'id_poule');
    }

    public function competiteur1(): BelongsTo
    {
        return $this->belongsTo(Competiteur::class, 'id_p1');
    }

    public function competiteur2(): BelongsTo
    {
        return $this->belongsTo(Competiteur::class, 'id_p2');
    }
}