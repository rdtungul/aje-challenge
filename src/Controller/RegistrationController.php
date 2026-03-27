<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class RegistrationController extends AbstractController
{
    /**
     * @Route("/api/register", name="app_register", methods={"POST"})
     */
    public function register(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->json(['error' => 'Email and password are required.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Invalid email address.'], 400);
        }

        if (strlen($password) < 6) {
            return $this->json(['error' => 'Password must be at least 6 characters.'], 400);
        }

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(['error' => 'An account with this email already exists.'], 400);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($userPasswordHasher->hashPassword($user, $password));
        $user->setConfirmToken(bin2hex(random_bytes(32)));

        $entityManager->persist($user);
        $entityManager->flush();

        $this->saveConfirmationEmail($user);

        return $this->json([
            'message' => 'Registration successful! Please confirm your email address.',
            'confirmToken' => $user->getConfirmToken(),
        ], 201);
    }

    private function saveConfirmationEmail(User $user): void
    {
        $emailDir = $this->getParameter('kernel.project_dir') . '/var/emails';

        if (!is_dir($emailDir)) {
            mkdir($emailDir, 0777, true);
        }

        $confirmUrl = 'http://localhost:81/api/confirm-email/' . $user->getConfirmToken();

        $emailContent = <<<TEXT
To: {$user->getEmail()}
Subject: Confirm your AJE Notes account

Hello,

Thank you for registering! Please click the link below to confirm your email address:

{$confirmUrl}

If you did not create an account, you can safely ignore this email.

Best regards,
AJE Notes Team
TEXT;

        $filename = $emailDir . '/confirm_' . md5($user->getEmail()) . '.txt';
        file_put_contents($filename, $emailContent);
    }
}
