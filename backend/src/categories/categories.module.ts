import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
