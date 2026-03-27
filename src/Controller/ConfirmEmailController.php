<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;

class ConfirmEmailController extends AbstractController
{
    /**
     * @Route("/api/confirm-email/{token}", name="app_confirm_email", methods={"GET"})
     */
    public function confirm(
        string $token,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): RedirectResponse {
        $user = $userRepository->findOneBy(['confirmToken' => $token]);

        if (!$user) {
            return $this->redirect('/?confirmed=error');
        }

        $user->setIsVerified(true);
        $user->setConfirmToken(null);

        $entityManager->flush();

        return $this->redirect('/?confirmed=1');
    }
}
