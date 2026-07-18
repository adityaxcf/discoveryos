export const DEMO_DATASET = {
  segments: [
    { id: 'seg-free', name: 'Free Users', description: 'Individual users on free plan', value_tier: 'Low' },
    { id: 'seg-premium', name: 'Premium Customers', description: 'Paid individual subscribers', value_tier: 'High' },
    { id: 'seg-business', name: 'Small Business Customers', description: 'SMB companies using our B2B offering', value_tier: 'Very High' },
  ],
  sources: [
    // FREE USERS - 6 sources
    {
      id: 'src-f1',
      title: 'Customer Interview: Sarah',
      type: 'Customer Interview',
      customer_name: 'Sarah M.',
      segment: 'Free Users',
      date: '2024-01-15',
      raw_content: `Sarah is a freelance designer who uses our payment platform occasionally to receive payments from clients. 
      
      KEY PAIN POINTS:
      - "The checkout process has too many steps. I lose customers at the payment page." She mentioned 3 clients didn't complete payments.
      - "When a payment fails, there's no clear reason why. Just says 'failed' and I have to ask the customer what card they used."
      - "I get notifications every single time someone views my invoice, even if they don't pay. It's overwhelming."
      - Positive: "Love the instant payouts feature compared to other platforms."
      - Missing feature: "Can't set up recurring payments for my retainer clients. Have to manually invoice every month."`,
    },
    {
      id: 'src-f2',
      title: 'Support Ticket: John D.',
      type: 'Support Ticket',
      customer_name: 'John D.',
      segment: 'Free Users',
      date: '2024-01-18',
      raw_content: `Support ticket: "My customer's card was declined but they were charged twice. After 48 hours, only one charge is showing. Where's the other money? How do I refund them?"
      
      Issue: Customer experienced double-charge on failed transaction. Second charge appeared in account 2 days later.
      Resolution: Manual intervention required. Customer manually refunded $47.
      Root cause: Payment retry logic not immediately visible to user during decline.`,
    },
    {
      id: 'src-f3',
      title: 'Survey Response: Alex T.',
      type: 'Survey Response',
      customer_name: 'Alex T.',
      segment: 'Free Users',
      date: '2024-01-20',
      raw_content: `Survey Question: "What would make you upgrade to Premium?"
      
      Response: "I'd upgrade if I could search my transaction history better. Right now I can only sort by date. If a customer asks 'Did I pay you on the 15th or 16th?', I can't find it quickly. Also the dashboard is confusing - I don't know where to click for basic info."`,
    },
    {
      id: 'src-f4',
      title: 'Support Ticket: Maria G.',
      type: 'Support Ticket',
      customer_name: 'Maria G.',
      segment: 'Free Users',
      date: '2024-01-22',
      raw_content: `Ticket: "I'm trying to onboard but the form keeps saying my information is invalid. I've tried 4 times with my correct address. Do you validate against a database? Your error messages don't tell me what's wrong."
      
      User had correct address format but system rejected due to postal code lookup service being temporarily down.
      User gave up after 4 attempts.
      Churn risk: High - never completed signup.`,
    },
    {
      id: 'src-f5',
      title: 'App Review: Mobile App Store',
      type: 'App Review',
      customer_name: 'Anonymous User',
      segment: 'Free Users',
      date: '2024-01-25',
      raw_content: `Rating: 2/5 stars
      "App crashes when I try to export my transaction list as CSV. Also, I can only see the last 30 days of transactions in the mobile app, but the web version shows 90 days. Why the difference? Made it through onboarding but the app feels incomplete."`,
    },
    {
      id: 'src-f6',
      title: 'Customer Interview: Emma L.',
      type: 'Customer Interview',
      customer_name: 'Emma L.',
      segment: 'Free Users',
      date: '2024-01-28',
      raw_content: `Emma is a part-time consultant testing multiple payment platforms.
      
      Experience with checkout: "I actually like the design, but my clients mention it's different from PayPal/Stripe - they get confused by where to enter card details. Some of them think it's a scam because it looks different from what they're used to."
      
      Positive feedback: "Your customer service has been helpful when I had questions."
      
      Considering: "Probably going to switch to the market leader because I need invoicing, recurring billing, and this platform seems more for one-off payments."`,
    },

    // PREMIUM CUSTOMERS - 9 sources
    {
      id: 'src-p1',
      title: 'Customer Interview: David Chen',
      type: 'Customer Interview',
      customer_name: 'David Chen',
      segment: 'Premium Customers',
      date: '2024-01-16',
      raw_content: `David runs an online course platform with ~500 subscribers. Premium paying customer for 8 months.
      
      CRITICAL: "When payments fail, my customers churn immediately because they can't access their courses. There's a 24-hour lag before I know who failed. I'm losing $2-3K monthly to payment failures that could be recoverable with retry logic."
      
      Feature request: "I need to set expiration dates on course access based on subscription status. Right now I can only do it manually."
      
      Positive: "Integrations with my course platform are solid. API documentation is clear."
      
      Complaint: "Your disputes/chargeback process is opaque. A customer claimed they didn't authorize a charge and it cost me the full month's revenue plus a $15 fee. I had delivery proof but couldn't submit it through your system."`,
    },
    {
      id: 'src-p2',
      title: 'Support Ticket: Lisa Wong',
      type: 'Support Ticket',
      customer_name: 'Lisa Wong',
      segment: 'Premium Customers',
      date: '2024-01-19',
      raw_content: `Ticket: Recurring payment setup issues
      "I set up 10 subscription products but 3 of them have the wrong billing cycle showing in customer emails. Customers are confused about when they'll be charged. How do I fix this without recreating everything?"
      
      Root cause: Timezone mismatch in billing cycle date. Manual database edit required.
      Customer satisfaction: Low. Time to resolution: 3 days.`,
    },
    {
      id: 'src-p3',
      title: 'NPS Survey: James M.',
      type: 'Survey Response',
      customer_name: 'James M.',
      segment: 'Premium Customers',
      date: '2024-01-21',
      raw_content: `NPS Score: 6/10 (Detractor)
      
      "Your transaction search is inadequate. I need to find a specific payment for a customer dispute, but I can only search by customer name or date range. If someone says 'I paid last week with my Amex,' I have to look through 50+ transactions. This takes 15 minutes instead of 30 seconds on Stripe."
      
      "Also, I've been charged incorrectly twice in the past 6 months. Once for excessive API calls I didn't make. Once for a feature I disabled. Both required support tickets to fix."`,
    },
    {
      id: 'src-p4',
      title: 'Customer Feedback Form: Alex Kumar',
      type: 'Feedback Form',
      customer_name: 'Alex Kumar',
      segment: 'Premium Customers',
      date: '2024-01-23',
      raw_content: `"I'm considering leaving because of your notification system. I get:
      - Email every successful payment
      - Email every failed payment
      - SMS for disputes
      - In-app notifications for refunds
      - Webhook for my integrations
      
      I'm getting 10-15 notifications daily. I turned off most because they're noise. But then I missed an actual fraud alert. Why not let me choose WHICH events I care about? Let me set priorities?"`,
    },
    {
      id: 'src-p5',
      title: 'Support Ticket: Priya Patel',
      type: 'Support Ticket',
      customer_name: 'Priya Patel',
      segment: 'Premium Customers',
      date: '2024-01-26',
      raw_content: `Ticket: Refund processing delays
      "Customer requested refund on Jan 22. Status shows 'processing' but the refund hasn't hit their card yet. It's now Jan 26. Where's the refund? How long will it take? Your dashboard just says 'processing' with no timeline."
      
      Investigation revealed: Refund stuck in batch processing due to bank delay. System shows "processing" for both "waiting in queue" and "in transit" states. User can't distinguish.
      Support had no visibility into which state the refund was in.
      Customer had to follow up twice.`,
    },
    {
      id: 'src-p6',
      title: 'Customer Interview: Rachel S.',
      type: 'Customer Interview',
      customer_name: 'Rachel S.',
      segment: 'Premium Customers',
      date: '2024-01-27',
      raw_content: `Rachel manages payments for a digital product marketplace with 1,200 monthly customers.
      
      Pain point: "Your dashboard loads slowly when I have a lot of transactions. Takes 5-10 seconds to filter by date range. And there's no way to bulk-export or bulk-refund. If I need to refund 50 customers, I do it one by one."
      
      Scaling issue: "As I grow, your platform feels like it wasn't built for scale. I'm looking at alternatives that can handle 10K+ transactions per day."
      
      Positive: "Your support team is responsive. When I call with issues, someone picks up."`,
    },
    {
      id: 'src-p7',
      title: 'Product Feedback: Nate B.',
      type: 'Chat Feedback',
      customer_name: 'Nate B.',
      segment: 'Premium Customers',
      date: '2024-01-29',
      raw_content: `Chat feedback during platform tour:
      "I notice you don't have multi-currency support. I have customers from Canada, UK, and US. Can't use your platform if I can't accept CAD and GBP. That's a dealbreaker."`,
    },
    {
      id: 'src-p8',
      title: 'Support Ticket: Michael Torres',
      type: 'Support Ticket',
      customer_name: 'Michael Torres',
      segment: 'Premium Customers',
      date: '2024-02-01',
      raw_content: `Ticket: Billing integration issues
      "I'm trying to integrate with my accounting software (QuickBooks). Your API doesn't include customer billing address in the webhook. QuickBooks needs it. I can't automate my billing workflow. Back to manual entry."
      
      Missing: customer_billing_address in payment_completed webhook
      Workaround: None. Customer having to make separate API call.
      Impact: Lost 2 hours setting up the integration.`,
    },
    {
      id: 'src-p9',
      title: 'Customer Interview: Sophie Lee',
      type: 'Customer Interview',
      customer_name: 'Sophie Lee',
      segment: 'Premium Customers',
      date: '2024-02-02',
      raw_content: `Sophie runs a fitness coaching business with subscription model. High-value customer ($8K/month).
      
      Critical issue: "When a customer tries to update their payment method, the UI is confusing. They end up creating a NEW subscription instead of updating the existing one. I have to manually clean up duplicates. This has happened 6 times in 3 weeks."
      
      Feature: "I need dunning management. If a payment fails, send the customer an email to update their card, retry after 3 days. Automatically pause if 3 attempts fail. I shouldn't have to manage this manually."
      
      Positive: "Your recurring billing engine is solid when everything works."`,
    },

    // SMALL BUSINESS CUSTOMERS - 5 sources
    {
      id: 'src-b1',
      title: 'Customer Interview: Roberto Sanchez',
      type: 'Customer Interview',
      customer_name: 'Roberto Sanchez',
      segment: 'Small Business Customers',
      date: '2024-01-17',
      raw_content: `Roberto owns a digital marketing agency with 12 employees, $180K monthly revenue. Premium B2B customer.
      
      TOP BLOCKER: "I need to require 2FA for my team's access to payment settings. One employee logged in from a cafe and we had a fraud attempt. Your platform doesn't support 2FA. That's a security nightmare for a B2B product."
      
      Process issue: "We have 15 client accounts but only one master account. I need role-based access - account managers can view THEIR client's payments but not others'. Currently, everyone sees everything."
      
      Negative impact: "I'm limiting who has dashboard access because of this. It means I'm manually pulling reports for my team instead of them having self-service access."
      
      Would stay if: "Add team management, SSO, and 2FA. Then we'd upgrade to your enterprise plan."`,
    },
    {
      id: 'src-b2',
      title: 'Support Ticket: Jennifer Wu',
      type: 'Support Ticket',
      customer_name: 'Jennifer Wu',
      segment: 'Small Business Customers',
      date: '2024-01-24',
      raw_content: `Ticket: Integration with inventory/POS system
      "We're a retail shop using Square POS. Your platform doesn't integrate with Square. Every sale in Square needs to be manually reconciled in your system. We're doing this daily. How can we sync inventory when payments are in a different platform?"
      
      Impact: 30 minutes daily manual reconciliation
      Team: 2 people
      Monthly impact: ~20 hours wasted
      Status: Considering switching to Stripe because of better ecosystem`,
    },
    {
      id: 'src-b3',
      title: 'Customer Interview: Mark Johnson',
      type: 'Customer Interview',
      customer_name: 'Mark Johnson',
      segment: 'Small Business Customers',
      date: '2024-01-30',
      raw_content: `Mark runs a SaaS consulting firm with 25 employees. Heavy platform user (5K+ transactions/month).
      
      Compliance issue: "We need audit logs. I need to see who accessed what payment information, when, and from where. For compliance, HIPAA, and internal security, we need an audit trail. Your platform has no audit logs. This is a blocker for enterprise deals."
      
      Volume issue: "Your API rate limits are too low for our volume. We hit limits during end-of-month reporting. We have to stagger requests and wait. Need at least 10x higher limits or have limits be dynamic."
      
      Opportunity: "If you can solve team management, 2FA, audit logs, and higher API limits, we'd commit to a 2-year contract."`,
    },
    {
      id: 'src-b4',
      title: 'Product Demo Feedback: Linda Garcia',
      type: 'Demo Feedback',
      customer_name: 'Linda Garcia',
      segment: 'Small Business Customers',
      date: '2024-02-03',
      raw_content: `Linda runs an education/training company. During product demo:
      
      "How do you handle tax calculation? We operate in 8 states with different sales tax rates. Do you auto-calculate based on customer location?"
      
      Answer: No, manual entry required.
      
      Response: "That's a dealbreaker. We need automatic tax compliance. Half of our customers are in different states. Doing this manually would be impossible."
      
      Churn risk: Won't proceed with platform adoption.`,
    },
    {
      id: 'src-b5',
      title: 'Customer Interview: Thomas Chen',
      type: 'Customer Interview',
      customer_name: 'Thomas Chen',
      segment: 'Small Business Customers',
      date: '2024-02-04',
      raw_content: `Thomas leads a team at a wholesale distribution company. 18-month customer.
      
      Positive: "Your platform is more affordable than competitors for our volume. That's why we use it."
      
      Main pain: "But we're outgrowing it. We need batch payment capabilities - send payments to 200+ suppliers in one go, not individually. We need vendor management, payment scheduling, and approval workflows."
      
      Alternative: "Investigating enterprise alternatives (Tipalti, ACI Worldwide) because they have the B2B payment orchestration we need."
      
      Migration cost: High (custom integrations), but considering because of business need.`,
    },
  ],
}
