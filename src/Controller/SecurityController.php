<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class SecurityController extends AbstractController
{
    /**
     * @Route("/api/me", name="app_me", methods={"GET"})
     */
    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getUserIdentifier(),
        ]);
    }

    /**
     * @Route("/api/login", name="app_login", methods={"POST"})
     */
    public function login(): void
    {
        // Intercepted by json_login firewall — this is never reached
        throw new \LogicException('This should not be reached.');
    }

    /**
     * @Route("/api/logout", name="app_logout", methods={"POST"})
     */
    public function logout(): void
    {
        // This method is handled by Symfony security logout
        throw new \LogicException('This should not be reached.');
    }
}
