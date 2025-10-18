// ============================================================================
// DATABASE SEEDING SCRIPT
// Populates the database with sample data for development and testing
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Main seeding function
 */
async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Seed brands
    console.log('📦 Seeding brands...')
    const brands = await seedBrands()
    console.log(`✅ Created ${brands.length} brands\n`)

    // Seed services
    console.log('🛠️  Seeding services...')
    const services = await seedServices(brands)
    console.log(`✅ Created ${services.length} services\n`)

    // Seed CQI templates
    console.log('📋 Seeding CQI templates...')
    const templates = await seedCQITemplates(brands)
    console.log(`✅ Created ${templates.length} CQI templates\n`)

    // Seed sample CQI responses
    console.log('💬 Seeding sample CQI responses...')
    const responses = await seedCQIResponses(templates)
    console.log(`✅ Created ${responses.length} CQI responses\n`)

    // Seed sample trials
    console.log('🎯 Seeding sample trials...')
    const trials = await seedTrials(brands, services, responses)
    console.log(`✅ Created ${trials.length} trials\n`)

    // Seed sample ops tasks
    console.log('⚙️  Seeding sample ops tasks...')
    const tasks = await seedOpsTasks()
    console.log(`✅ Created ${tasks.length} ops tasks\n`)

    console.log('🎉 Database seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

/**
 * Seed brands
 */
async function seedBrands() {
  const brandsData = [
    {
      name: 'Boss of Clean',
      slug: 'boss-of-clean',
      domain: 'https://bossofclean.com',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      settings: {
        industry: 'cleaning_services',
        target_market: 'residential_commercial'
      }
    },
    {
      name: 'DLD Digital',
      slug: 'dld-digital',
      domain: 'https://dlddigital.com',
      primary_color: '#7c3aed',
      secondary_color: '#6d28d9',
      settings: {
        industry: 'digital_marketing',
        target_market: 'small_business'
      }
    },
    {
      name: 'SOTSVC',
      slug: 'sotsvc',
      domain: 'https://sotsvc.com',
      primary_color: '#059669',
      secondary_color: '#047857',
      settings: {
        industry: 'professional_services',
        target_market: 'enterprise'
      }
    }
  ]

  const { data, error } = await supabase
    .from('brands')
    .insert(brandsData)
    .select()

  if (error) throw error
  return data
}

/**
 * Seed services
 */
async function seedServices(brands: any[]) {
  const servicesData = [
    // Boss of Clean services
    {
      brand_id: brands[0].id,
      name: 'Residential Deep Clean',
      slug: 'residential-deep-clean',
      description: 'Comprehensive deep cleaning service for homes',
      features: [
        'All rooms thoroughly cleaned',
        'Kitchen and bathroom deep clean',
        'Eco-friendly products',
        'Satisfaction guaranteed'
      ],
      pricing: {
        amount: 199,
        currency: 'USD',
        billing_period: 'one-time'
      },
      category: 'residential_cleaning',
      stripe_price_id: 'price_residential_deep_clean'
    },
    {
      brand_id: brands[0].id,
      name: 'Commercial Cleaning Package',
      slug: 'commercial-cleaning-package',
      description: 'Regular cleaning service for offices and commercial spaces',
      features: [
        'Daily or weekly service',
        'Flexible scheduling',
        'Professional team',
        'Supplies included'
      ],
      pricing: {
        amount: 499,
        currency: 'USD',
        billing_period: 'monthly'
      },
      category: 'commercial_cleaning',
      stripe_price_id: 'price_commercial_cleaning'
    },
    // DLD Digital services
    {
      brand_id: brands[1].id,
      name: 'Website Design & Development',
      slug: 'website-design-development',
      description: 'Custom website design and development',
      features: [
        'Custom design',
        'Mobile responsive',
        'SEO optimized',
        '3 months support'
      ],
      pricing: {
        amount: 2999,
        currency: 'USD',
        billing_period: 'one-time'
      },
      category: 'web_design',
      stripe_price_id: 'price_web_design'
    },
    {
      brand_id: brands[1].id,
      name: 'Digital Marketing Suite',
      slug: 'digital-marketing-suite',
      description: 'Complete digital marketing management',
      features: [
        'SEO optimization',
        'Social media management',
        'Content creation',
        'Monthly reporting'
      ],
      pricing: {
        amount: 1499,
        currency: 'USD',
        billing_period: 'monthly'
      },
      category: 'digital_marketing',
      stripe_price_id: 'price_digital_marketing'
    }
  ]

  const { data, error } = await supabase
    .from('services')
    .insert(servicesData)
    .select()

  if (error) throw error
  return data
}

/**
 * Seed CQI templates
 */
async function seedCQITemplates(brands: any[]) {
  const templatesData = [
    {
      brand_id: brands[0].id,
      name: 'Cleaning Service Qualification',
      description: 'Qualify potential cleaning service customers',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What type of property needs cleaning?',
          options: ['Residential Home', 'Apartment', 'Office', 'Commercial Space']
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'How often do you need cleaning services?',
          options: ['One-time', 'Weekly', 'Bi-weekly', 'Monthly']
        },
        {
          id: 'q3',
          type: 'text',
          question: 'What are your biggest cleaning challenges?'
        },
        {
          id: 'q4',
          type: 'multiple_choice',
          question: 'What\'s your budget range?',
          options: ['Under $200', '$200-$500', '$500-$1000', 'Over $1000']
        }
      ],
      version: 1,
      is_active: true
    },
    {
      brand_id: brands[1].id,
      name: 'Digital Marketing Qualification',
      description: 'Qualify potential digital marketing clients',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What\'s your primary business goal?',
          options: ['Increase website traffic', 'Generate more leads', 'Improve brand awareness', 'Boost sales']
        },
        {
          id: 'q2',
          type: 'text',
          question: 'What marketing efforts have you tried before?'
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'What\'s your monthly marketing budget?',
          options: ['Under $1000', '$1000-$2500', '$2500-$5000', 'Over $5000']
        },
        {
          id: 'q4',
          type: 'text',
          question: 'What would success look like for you in 6 months?'
        }
      ],
      version: 1,
      is_active: true
    }
  ]

  const { data, error } = await supabase
    .from('cqi_templates')
    .insert(templatesData)
    .select()

  if (error) throw error
  return data
}

/**
 * Seed sample CQI responses
 */
async function seedCQIResponses(templates: any[]) {
  const responsesData = [
    {
      template_id: templates[0].id,
      brand_id: templates[0].brand_id,
      session_id: 'session_001',
      user_email: 'john.smith@example.com',
      user_name: 'John Smith',
      responses: {
        q1: 'Residential Home',
        q2: 'Bi-weekly',
        q3: 'Keeping up with deep cleaning while working full-time',
        q4: '$200-$500'
      },
      status: 'completed',
      completed_at: new Date().toISOString()
    },
    {
      template_id: templates[1].id,
      brand_id: templates[1].brand_id,
      session_id: 'session_002',
      user_email: 'sarah.johnson@business.com',
      user_name: 'Sarah Johnson',
      responses: {
        q1: 'Generate more leads',
        q2: 'Tried social media ads and SEO but didn\'t see consistent results',
        q3: '$1000-$2500',
        q4: 'Consistent flow of 20-30 qualified leads per month'
      },
      status: 'completed',
      completed_at: new Date().toISOString()
    }
  ]

  const { data, error } = await supabase
    .from('cqi_responses')
    .insert(responsesData)
    .select()

  if (error) throw error
  return data
}

/**
 * Seed sample trials
 */
async function seedTrials(brands: any[], services: any[], responses: any[]) {
  const trialsData = [
    {
      brand_id: brands[0].id,
      cqi_response_id: responses[0].id,
      service_id: services[0].id,
      user_email: 'john.smith@example.com',
      user_name: 'John Smith',
      recommended_service: {
        service_id: services[0].id,
        service_name: services[0].name,
        confidence_score: 92,
        reasoning: 'Based on bi-weekly need and budget, residential deep clean is perfect fit'
      },
      emotional_pitch_angle: 'Peace of mind and time freedom',
      script_or_copy: 'Hi John, imagine coming home to a spotless house every other week...',
      status: 'pending',
      stripe_customer_id: 'cus_sample_001'
    },
    {
      brand_id: brands[1].id,
      cqi_response_id: responses[1].id,
      service_id: services[3].id,
      user_email: 'sarah.johnson@business.com',
      user_name: 'Sarah Johnson',
      recommended_service: {
        service_id: services[3].id,
        service_name: services[3].name,
        confidence_score: 88,
        reasoning: 'Budget aligns with monthly marketing suite, goal-focused on lead generation'
      },
      emotional_pitch_angle: 'Predictable growth and business confidence',
      script_or_copy: 'Hi Sarah, let\'s turn those inconsistent results into a reliable lead machine...',
      status: 'active',
      stripe_customer_id: 'cus_sample_002',
      stripe_subscription_id: 'sub_sample_002',
      trial_start_date: new Date().toISOString()
    }
  ]

  const { data, error } = await supabase
    .from('trials')
    .insert(trialsData)
    .select()

  if (error) throw error
  return data
}

/**
 * Seed sample ops tasks
 */
async function seedOpsTasks() {
  const tasksData = [
    {
      name: 'Monitor website uptime',
      type: 'monitor_uptime',
      status: 'pending',
      priority: 7,
      config: {
        url: 'https://bossofclean.com',
        interval: '5m'
      },
      triggered_by: 'schedule'
    },
    {
      name: 'Backup production database',
      type: 'backup_database',
      status: 'completed',
      priority: 9,
      result: {
        status: 'success',
        backup_location: 's3://backups/db-2024-01-15.sql.gz',
        size_mb: 156
      },
      triggered_by: 'schedule',
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date().toISOString()
    },
    {
      name: 'Deploy new landing page',
      type: 'deploy_site',
      status: 'pending',
      priority: 5,
      config: {
        repo: 'dld-digital/landing-page',
        branch: 'main',
        environment: 'production'
      },
      triggered_by: 'manual',
      approved: true
    }
  ]

  const { data, error } = await supabase
    .from('ops_tasks')
    .insert(tasksData)
    .select()

  if (error) throw error
  return data
}

// Run the seed function
seed()

