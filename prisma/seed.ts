import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.posting.deleteMany()
  await prisma.journalEntry.deleteMany()
  await prisma.account.deleteMany()
  await prisma.settlement.deleteMany()
  await prisma.velocityLimit.deleteMany()
  await prisma.escrowedPoints.deleteMany()
  await prisma.whatsAppSession.deleteMany()
  await prisma.oTPVerification.deleteMany()
  await prisma.redemption.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.customerTier.deleteMany()
  await prisma.ledger.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.merchant.deleteMany()
  await prisma.mall.deleteMany()
  await prisma.categoryEarnRate.deleteMany()

  // Create platform accounts for double-entry system
  console.log('🏦 Creating platform accounts...')
  const platformAccounts = await Promise.all([
    prisma.account.create({
      data: {
        holderId: 'PLATFORM',
        holderType: 'PLATFORM',
        accountType: 'PLATFORM_LIABILITY',
        currency: 'PTS',
      },
    }),
    prisma.account.create({
      data: {
        holderId: 'PLATFORM',
        holderType: 'PLATFORM',
        accountType: 'PLATFORM_REVENUE',
        currency: 'INR',
      },
    }),
    prisma.account.create({
      data: {
        holderId: 'PLATFORM',
        holderType: 'PLATFORM',
        accountType: 'PLATFORM_ESCROW',
        currency: 'INR',
      },
    }),
  ])
  console.log(`✅ Created ${platformAccounts.length} platform accounts`)

  // Create category earn rates
  console.log('📊 Creating category earn rates...')
  const categories = await Promise.all([
    prisma.categoryEarnRate.create({
      data: {
        category: 'Fashion',
        earnRate: 5.0,
        marginProfile: 'HIGH',
        issuanceFee: 0.03,
        isActive: true,
      },
    }),
    prisma.categoryEarnRate.create({
      data: {
        category: 'F&B',
        earnRate: 7.0,
        marginProfile: 'MEDIUM',
        issuanceFee: 0.02,
        isActive: true,
      },
    }),
    prisma.categoryEarnRate.create({
      data: {
        category: 'Grocery',
        earnRate: 0.5,
        marginProfile: 'LOW',
        issuanceFee: 0.00,
        isActive: true,
      },
    }),
    prisma.categoryEarnRate.create({
      data: {
        category: 'Electronics',
        earnRate: 0.3,
        marginProfile: 'LOW',
        issuanceFee: 0.00,
        isActive: true,
      },
    }),
    prisma.categoryEarnRate.create({
      data: {
        category: 'Salon',
        earnRate: 4.0,
        marginProfile: 'MEDIUM',
        issuanceFee: 0.02,
        isActive: true,
      },
    }),
    prisma.categoryEarnRate.create({
      data: {
        category: 'Bakery',
        earnRate: 3.0,
        marginProfile: 'MEDIUM',
        issuanceFee: 0.015,
        isActive: true,
      },
    }),
  ])
  console.log(`✅ Created ${categories.length} category earn rates`)

  // Create malls
  console.log('🏢 Creating malls...')
  const malls = await Promise.all([
    prisma.mall.create({
      data: {
        name: 'Logix City Center',
        location: 'Sector 32, Noida',
        bonusWallet: 50000,
        bonusEnabled: true,
        bonusRate: 0.10,
        isActive: true,
      },
    }),
    prisma.mall.create({
      data: {
        name: 'Spectrum Metro',
        location: 'Greater Noida',
        bonusWallet: 30000,
        bonusEnabled: true,
        bonusRate: 0.10,
        isActive: true,
      },
    }),
  ])
  console.log(`✅ Created ${malls.length} malls`)

  // Create mall accounts
  for (const mall of malls) {
    await prisma.account.create({
      data: {
        holderId: mall.id,
        holderType: 'MALL',
        accountType: 'MALL_WALLET',
        currency: 'INR',
      },
    })
  }
  console.log(`✅ Created ${malls.length} mall accounts`)

  // Create merchants
  console.log('🏪 Creating merchants...')
  const merchants = await Promise.all([
    prisma.merchant.create({
      data: {
        name: 'Rajesh Kumar',
        shopName: 'Kumar General Store',
        phone: '9876543210',
        category: 'Grocery',
        address: 'Logix City Center, Sector 32, Noida',
        mallId: malls[0].id,
        walletBalance: 10000,
        settlementRate: 0.85,
        settlementCycle: 'T_PLUS_7',
        isActive: true,
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'Priya Sharma',
        shopName: 'Sharma Bakery',
        phone: '9876543211',
        category: 'Bakery',
        address: 'Spectrum Metro, Greater Noida',
        mallId: malls[1].id,
        walletBalance: 5000,
        settlementRate: 0.85,
        settlementCycle: 'T_PLUS_3',
        isActive: true,
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'Amit Patel',
        shopName: 'Style Salon',
        phone: '9876543212',
        category: 'Salon',
        address: 'Sector 18, Noida',
        walletBalance: 8000,
        settlementRate: 0.85,
        settlementCycle: 'T_PLUS_7',
        isActive: true,
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'Sneha Reddy',
        shopName: 'Fashion Boutique',
        phone: '9876543213',
        category: 'Fashion',
        address: 'Logix City Center, Sector 32, Noida',
        mallId: malls[0].id,
        walletBalance: 15000,
        settlementRate: 0.85,
        settlementCycle: 'T_PLUS_7',
        isActive: true,
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'Vikram Singh',
        shopName: 'Coffee Corner',
        phone: '9876543214',
        category: 'F&B',
        address: 'Brahmaputra Market, Sector 29, Noida',
        walletBalance: 3000,
        settlementRate: 0.85,
        settlementCycle: 'T_PLUS_1',
        isActive: true,
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'Arjun Electronics',
        shopName: 'Tech World',
        phone: '9876543215',
        category: 'Electronics',
        address: 'Spectrum Metro, Greater Noida',
        mallId: malls[1].id,
        walletBalance: 20000,
        settlementRate: 0.90,
        settlementCycle: 'NET_30',
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${merchants.length} merchants`)

  // Create merchant accounts
  console.log('💼 Creating merchant accounts...')
  for (const merchant of merchants) {
    await Promise.all([
      prisma.account.create({
        data: {
          holderId: merchant.id,
          holderType: 'MERCHANT',
          accountType: 'MERCHANT_PREPAID',
          currency: 'INR',
        },
      }),
      prisma.account.create({
        data: {
          holderId: merchant.id,
          holderType: 'MERCHANT',
          accountType: 'MERCHANT_PAYABLE',
          currency: 'INR',
        },
      }),
      prisma.account.create({
        data: {
          holderId: merchant.id,
          holderType: 'MERCHANT',
          accountType: 'MERCHANT_RECEIVABLE',
          currency: 'INR',
        },
      }),
    ])
  }
  console.log(`✅ Created accounts for ${merchants.length} merchants`)

  // Create customers
  console.log('👥 Creating customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Anita Desai',
        phone: '8765432100',
        totalPoints: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Rahul Verma',
        phone: '8765432101',
        totalPoints: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Meera Iyer',
        phone: '8765432102',
        totalPoints: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Karan Malhotra',
        phone: '8765432103',
        totalPoints: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Divya Nair',
        phone: '8765432104',
        totalPoints: 0,
      },
    }),
  ])

  console.log(`✅ Created ${customers.length} customers`)

  // Create customer accounts
  console.log('👛 Creating customer accounts...')
  for (const customer of customers) {
    await prisma.account.create({
      data: {
        holderId: customer.id,
        holderType: 'USER',
        accountType: 'USER_WALLET',
        currency: 'PTS',
      },
    })
  }
  console.log(`✅ Created accounts for ${customers.length} customers`)

  // Create sample transactions
  console.log('💳 Creating sample transactions...')
  const transactions = []

  // Customer 1: Anita - shops at multiple stores
  const tx1 = await prisma.transaction.create({
    data: {
      merchantId: merchants[0].id,
      customerId: customers[0].id,
      amount: 500,
      pointsEarned: 5,
      type: 'EARN',
    },
  })
  await prisma.customer.update({
    where: { id: customers[0].id },
    data: { totalPoints: { increment: 5 } },
  })
  await prisma.merchant.update({
    where: { id: merchants[0].id },
    data: { walletBalance: { decrement: 5 } },
  })
  transactions.push(tx1)

  const tx2 = await prisma.transaction.create({
    data: {
      merchantId: merchants[1].id,
      customerId: customers[0].id,
      amount: 300,
      pointsEarned: 4.5,
      type: 'EARN',
    },
  })
  await prisma.customer.update({
    where: { id: customers[0].id },
    data: { totalPoints: { increment: 4.5 } },
  })
  await prisma.merchant.update({
    where: { id: merchants[1].id },
    data: { walletBalance: { decrement: 4.5 } },
  })
  transactions.push(tx2)

  // Customer 2: Rahul - high spender
  const tx3 = await prisma.transaction.create({
    data: {
      merchantId: merchants[3].id,
      customerId: customers[1].id,
      amount: 2000,
      pointsEarned: 20,
      type: 'EARN',
    },
  })
  await prisma.customer.update({
    where: { id: customers[1].id },
    data: { totalPoints: { increment: 20 } },
  })
  await prisma.merchant.update({
    where: { id: merchants[3].id },
    data: { walletBalance: { decrement: 20 } },
  })
  transactions.push(tx3)

  // Customer 3: Meera - regular customer
  const tx4 = await prisma.transaction.create({
    data: {
      merchantId: merchants[2].id,
      customerId: customers[2].id,
      amount: 800,
      pointsEarned: 16,
      type: 'EARN',
    },
  })
  await prisma.customer.update({
    where: { id: customers[2].id },
    data: { totalPoints: { increment: 16 } },
  })
  await prisma.merchant.update({
    where: { id: merchants[2].id },
    data: { walletBalance: { decrement: 16 } },
  })
  transactions.push(tx4)

  console.log(`✅ Created ${transactions.length} transactions`)

  // Create sample redemptions
  console.log('🎁 Creating sample redemptions...')
  const redemption1 = await prisma.redemption.create({
    data: {
      merchantId: merchants[4].id,
      customerId: customers[0].id,
      pointsUsed: 5,
      discount: 5,
      settlementAmount: 5 * 0.85, // 85% settlement rate
    },
  })
  await prisma.customer.update({
    where: { id: customers[0].id },
    data: { totalPoints: { decrement: 5 } },
  })

  console.log('✅ Created 1 redemption')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   Merchants: ${merchants.length}`)
  console.log(`   Customers: ${customers.length}`)
  console.log(`   Transactions: ${transactions.length}`)
  console.log(`   Redemptions: 1`)
  console.log('\n💡 You can now test the application with sample data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
