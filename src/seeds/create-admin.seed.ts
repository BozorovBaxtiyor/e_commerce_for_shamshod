import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Category } from '../category/entities/category.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Review } from '../review/entities/review.entity';
import * as dotenv from 'dotenv';

// .env faylni yuklash
dotenv.config();

// Qo'llash: ts-node bilan ishga tushurish yoki uni package.json scriptiga qo'shing
async function run() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'test',
    entities: [User, Cart, CartItem, Category, Order, OrderItem, Product, Review],
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);

  const exists = await userRepo.findOne({
    where: { email: 'admin@example.com' },
  });
  if (exists) {
    exists.roles = 'admin';
    await userRepo.save(exists);
    console.log('Existing user updated to admin');
    await dataSource.destroy();
    return;
  }

  const hashed = bcrypt.hashSync('Admin123!', 10);
  const admin = userRepo.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashed,
    roles: 'admin',
  });
  await userRepo.save(admin);
  console.log('Admin user created');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
