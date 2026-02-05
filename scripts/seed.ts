import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxezdhlspjilclwsswki.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZXpkaGxzcGppbGNsd3Nzd2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDU2MjEsImV4cCI6MjA4NDA4MTYyMX0.bDSSHZxDTfAPF13xs6RvqcOoR4Lk2SDLjEV_bbyfwzI'

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleArguments = [
  {
    title: "My girlfriend says I spend too much time gaming",
    my_take: "Gaming is my hobby and stress relief after work. I only play 2-3 hours in the evening, which is reasonable. I always make time for our date nights and weekends together. Everyone needs their own hobbies.",
    their_take: "We barely spend quality time together anymore. When I come home from work, you're already in front of the screen. Even on weekends, you're playing with your friends instead of going out with me. A few hours a day adds up to a lot of missed time.",
    category: "Relationships",
    my_votes: 156,
    their_votes: 203,
    upvote_count: 89,
  },
  {
    title: "My roommate thinks it's okay to eat my labeled food",
    my_take: "If food is labeled with someone's name, it's off limits. Period. I specifically label my groceries because I meal prep for the week. Having my lunch disappear ruins my plans and budget.",
    their_take: "We've been roommates for years and used to share everything. If something's about to expire, it's wasteful to let it go bad. Plus, I always offer to replace what I take. It's not that serious.",
    category: "Roommates",
    my_votes: 412,
    their_votes: 67,
    upvote_count: 234,
  },
  {
    title: "My friend says a hot dog IS a sandwich",
    my_take: "A hot dog is its own distinct food category. The bun is connected on one side, making it structurally different from a sandwich. By this logic, a taco would also be a sandwich. Words have meanings.",
    their_take: "A sandwich is any food where the filling is between bread or a bread-like product. Hot dogs have bread on the outside and meat in the middle - that's the definition of a sandwich. The hinge doesn't matter.",
    category: "Food",
    my_votes: 187,
    their_votes: 245,
    upvote_count: 156,
  },
  {
    title: "My coworker says replying 'OK' to emails is rude",
    my_take: "Email is for efficiency. If I understood and agree, 'OK' conveys that perfectly. Not every message needs a paragraph response. People who expect more are adding unnecessary friction to communication.",
    their_take: "Professional communication requires effort. 'OK' feels dismissive, like you didn't even read the email properly. A simple 'Thanks for letting me know' or 'Got it, I'll handle this' shows basic respect.",
    category: "Work",
    my_votes: 298,
    their_votes: 312,
    upvote_count: 178,
  },
  {
    title: "My mom thinks I should call her every single day",
    my_take: "I'm an adult with a busy life. Weekly calls are reasonable and give us more to talk about. Daily calls feel like check-ins and put pressure on an otherwise healthy relationship. Quality over quantity.",
    their_take: "A quick call only takes 5 minutes. It's about staying connected and showing you care. I worry when I don't hear from you. Your grandparents would have loved this kind of connection when they were alive.",
    category: "Family",
    my_votes: 267,
    their_votes: 198,
    upvote_count: 145,
  },
  {
    title: "My friend says splitting the bill evenly is fair even if I ordered less",
    my_take: "If I ordered a salad and water while you got steak and cocktails, why should I subsidize your meal? Venmo exists. We can each pay for what we ordered. That's actual fairness.",
    their_take: "We're friends going out to have a good time, not accountants. Splitting evenly keeps things simple and it usually evens out over time. Nickel-and-diming every meal is exhausting and kills the vibe.",
    category: "Money",
    my_votes: 378,
    their_votes: 156,
    upvote_count: 203,
  },
  {
    title: "My teammate says camping in FPS games is a legitimate strategy",
    my_take: "Camping ruins the game for everyone. It's boring to play against and boring to do. If you need to sit in a corner to get kills, you're not actually good at the game. Go play a tower defense game.",
    their_take: "Holding angles and controlling areas is literally military tactics. If running around like a headless chicken was the only valid strategy, there wouldn't be sniper rifles in the game. Adapt or stay mad.",
    category: "Gaming",
    my_votes: 234,
    their_votes: 289,
    upvote_count: 167,
  },
  {
    title: "My friend says water is wet",
    my_take: "Water makes other things wet but isn't wet itself. Wetness is the state of being covered in water. You can't cover water with water - it just becomes more water. Water IS the wetness.",
    their_take: "Each water molecule is surrounded by other water molecules. If wetness means having water on something, then water molecules are constantly touching water. Water is literally the wettest thing possible.",
    category: "Random",
    my_votes: 342,
    their_votes: 387,
    upvote_count: 456,
  },
  {
    title: "My partner says keeping score in arguments is toxic",
    my_take: "I'm not 'keeping score' - I'm remembering patterns. When someone repeatedly does the same hurtful thing, it's valid to point out that this isn't the first time. That's called having a memory.",
    their_take: "Each disagreement should be resolved on its own merits. Bringing up past arguments creates a hostile environment where no one can move forward. It shows you haven't actually forgiven previous issues.",
    category: "Relationships",
    my_votes: 198,
    their_votes: 267,
    upvote_count: 134,
  },
  {
    title: "My coworker says cereal is a soup",
    my_take: "Cereal is cereal. Soup is made by cooking ingredients in liquid. Cereal is prepared by pouring cold liquid on grain. The process, serving temperature, and cultural context are completely different.",
    their_take: "Soup is a dish made by combining a solid food with liquid. Cereal with milk fits this definition perfectly. Cold soups like gazpacho exist, so temperature isn't a valid argument. Cereal is breakfast soup.",
    category: "Food",
    my_votes: 156,
    their_votes: 234,
    upvote_count: 189,
  },
]

async function seed() {
  console.log('Seeding sample arguments...')

  const endsAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  for (const arg of sampleArguments) {
    const { error } = await supabase.from('arguments').insert({
      title: arg.title,
      my_take: arg.my_take,
      their_take: arg.their_take,
      category: arg.category,
      my_votes: arg.my_votes,
      their_votes: arg.their_votes,
      upvote_count: arg.upvote_count,
      is_anonymous: true,
    })

    if (error) {
      console.error('Error inserting argument:', arg.title, error)
    } else {
      console.log('Inserted:', arg.title)
    }
  }

  console.log('Done!')
}

seed()
