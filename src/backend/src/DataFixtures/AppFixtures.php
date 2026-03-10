<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use App\Factory\ServerFactory;
use App\Factory\Database\DatabaseFactory;

class AppFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        foreach (UserFixture::$users as $userFixture) {
            $user = $this->getReference($userFixture['email']);
            $workspace = $user->getWorkspaces()[0];
            $servers = ServerFactory::createMany(2, [
                'workspace' => $workspace
            ]);

            foreach ($servers as $server) {
                DatabaseFactory::createMany(2, [
                    'server' => $server,
                    'workspace' => $workspace
                ]);
            }
        }
    }

    public function getDependencies(): array
    {
        return [
            UserFixture::class,
        ];
    }
}
