<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Note;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Note|null find($id, $lockMode = null, $lockVersion = null)
 * @method Note|null findOneBy(array $criteria, array $orderBy = null)
 * @method Note[]    findAll()
 * @method Note[]    findBy(array $criteria, array $orderBy = null)
 */
class NoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Note::class);
    }

    public function findByUserWithFilters(User $user, ?string $search, ?string $status, ?string $category): array
    {
        $qb = $this->createQueryBuilder('n')
            ->where('n.user = :user')
            ->setParameter('user', $user)
            ->orderBy('n.createdAt', 'DESC');

        if ($search) {
            $qb->andWhere('n.title LIKE :search OR n.content LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        if ($status) {
            $qb->andWhere('n.status = :status')
               ->setParameter('status', $status);
        }

        if ($category) {
            $qb->andWhere('n.category = :category')
               ->setParameter('category', $category);
        }

        return $qb->getQuery()->getResult();
    }
}
