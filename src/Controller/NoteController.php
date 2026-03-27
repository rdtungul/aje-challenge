<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Note;
use App\Entity\User;
use App\Repository\NoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/notes")
 */
class NoteController extends AbstractController
{
    /**
     * @Route("", name="app_notes_list", methods={"GET"})
     */
    public function list(Request $request, NoteRepository $noteRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $search = $request->query->get('search');
        $status = $request->query->get('status');
        $category = $request->query->get('category');

        $notes = $noteRepository->findByUserWithFilters($user, $search, $status, $category);

        return $this->json(array_map(fn(Note $note) => $note->toArray(), $notes));
    }

    /**
     * @Route("", name="app_notes_create", methods={"POST"})
     */
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');
        $category = $data['category'] ?? '';
        $status = $data['status'] ?? 'new';

        if (!$title || !$content || !$category) {
            return $this->json(['error' => 'Title, content and category are required.'], 400);
        }

        if (!in_array($status, Note::STATUSES)) {
            return $this->json(['error' => 'Invalid status.'], 400);
        }

        if (!in_array($category, Note::CATEGORIES)) {
            return $this->json(['error' => 'Invalid category.'], 400);
        }

        $note = new Note();
        $note->setTitle($title);
        $note->setContent($content);
        $note->setCategory($category);
        $note->setStatus($status);
        $note->setUser($user);

        $entityManager->persist($note);
        $entityManager->flush();

        return $this->json($note->toArray(), 201);
    }

    /**
     * @Route("/{id}", name="app_notes_update", methods={"PUT"})
     */
    public function update(int $id, Request $request, NoteRepository $noteRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $note = $noteRepository->find($id);

        if (!$note || $note->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Note not found.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');
        $category = $data['category'] ?? '';
        $status = $data['status'] ?? '';

        if (!$title || !$content || !$category) {
            return $this->json(['error' => 'Title, content and category are required.'], 400);
        }

        if (!in_array($status, Note::STATUSES)) {
            return $this->json(['error' => 'Invalid status.'], 400);
        }

        if (!in_array($category, Note::CATEGORIES)) {
            return $this->json(['error' => 'Invalid category.'], 400);
        }

        $note->setTitle($title);
        $note->setContent($content);
        $note->setCategory($category);
        $note->setStatus($status);

        $entityManager->flush();

        return $this->json($note->toArray());
    }

    /**
     * @Route("/{id}", name="app_notes_delete", methods={"DELETE"})
     */
    public function delete(int $id, NoteRepository $noteRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $note = $noteRepository->find($id);

        if (!$note || $note->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Note not found.'], 404);
        }

        $entityManager->remove($note);
        $entityManager->flush();

        return $this->json(['message' => 'Note deleted.']);
    }
}
