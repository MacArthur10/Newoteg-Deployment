import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AchatModule } from './achat/achat.module';
import { AdminModule } from './admin/admin.module';
import { AttributModule } from './attribut/attribut.module';
import { AuthModule } from './auth/auth.module';
import { CaisseModule } from './caisse/caisse.module';
import { CategorieModule } from './categorie/categorie.module';
import { ClientModule } from './client/client.module';
import { DatabaseModule } from './database/database.module';
import { FournisseurModule } from './fournisseur/fournisseur.module';
import { LigneAchatModule } from './ligne-achat/ligne-achat.module';
import { LigneVenteModule } from './ligne-vente/ligne-vente.module';
import { MouvementStockModule } from './mouvement-stock/mouvement-stock.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProduitModule } from './produit/produit.module';
import { ProductsModule } from './products/products.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RoleModule } from './role/role.module';
import { ValeurAttributModule } from './valeur-attribut/valeur-attribut.module';
import { VarianteProduitAttributModule } from './variante-produit-attribut/variante-produit-attribut.module';
import { VarianteProduitModule } from './variante-produit/variante-produit.module';
import { VenteModule } from './vente/vente.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    DatabaseModule,
    AuthModule,
    ProductsModule,
    ReservationsModule,
    AdminModule,
    CategorieModule,
    ProduitModule,
    AttributModule,
    ValeurAttributModule,
    VarianteProduitModule,
    VarianteProduitAttributModule,
    FournisseurModule,
    ClientModule,
    AchatModule,
    LigneAchatModule,
    VenteModule,
    LigneVenteModule,
    MouvementStockModule,
    CaisseModule,
    RoleModule,
  ],
})
export class AppModule {}
