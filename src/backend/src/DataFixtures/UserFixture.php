<?php

namespace App\DataFixtures;

use App\Entity\Workspace\User;
use App\Entity\Workspace\Workspace;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class UserFixture extends Fixture
{
    public static array $users = [
        [
            'email' => 'test1@example.com',
            'firstname' => 'John',
            'lastname' => 'Doe1',
            'password' => 12345,
            'workspace' => 'Company1',
        ],
        [
            'email' => 'test2@example.com',
            'firstname' => 'John',
            'lastname' => 'Doe1',
            'password' => 12345,
            'workspace' => 'Company2',
        ]
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this::$users as $userFixture) {
            $user = new User();
            $user->setFirstname($userFixture['firstname'])
                ->setLastname($userFixture['lastname'])
                ->setPassword($userFixture['password'])
                ->setEmail($userFixture['email']);

            $this->setReference($userFixture['email'], $user);
            $manager->persist($user);
            $manager->flush();

            $workspace = new Workspace();
            $workspace->setName($userFixture['workspace']);
            $workspace->addUser($user);

            $manager->persist($workspace);
            $manager->flush();
        }
    }
}
