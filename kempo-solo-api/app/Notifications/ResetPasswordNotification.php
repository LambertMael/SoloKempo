<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    private string $token;
    private string $resetUrl;

    public function __construct(string $token)
    {
        $this->token = $token;
        $this->resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password/' . $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Réinitialisation de mot de passe')
            ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.')
            ->action('Réinitialiser le mot de passe', $this->resetUrl)
            ->line('Ce lien de réinitialisation expirera dans 24 heures.')
            ->line('Si vous n\'avez pas demandé de réinitialisation de mot de passe, aucune action n\'est requise.');
    }
}