const { createClient } = require('@supabase/supabase-js');

async function main() {
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const id = "03a06303-ff03-41bf-8199-83d7f96bec28";
  
  const bodyHtml = `
<p><strong>Looking for the best physiotherapy clinic in Bopal?</strong></p>
<p>If you live in Bopal, South Bopal, Ghuma, Shela or Ambli, expert physiotherapy care is closer than you think. <strong>Dr Physio &mdash; Physiotherapy, Sports Injury Clinic, Fitness Studio &amp; Child Development Center</strong> is located at Amrapali Axiom Complex in Bopal, Ahmedabad, and has been helping patients recover from pain and injury for over a decade.</p>
<p>Led by Dr Jeetendra Brahmbhatt and Dr Fulwa Brahmbhatt, the clinic has earned a 5.0-star rating from more than 590 Google reviews &mdash; from real patients across Bopal and Ahmedabad.</p>
<h3>What conditions do we treat at our Bopal clinic?</h3>
<p>Our physiotherapy services cover the full range of everyday and specialist needs:</p>
<ul>
<li><strong>Back, neck and sciatica pain</strong> &mdash; relief from posture-related and chronic pain</li>
<li><strong>Sports injuries</strong> &mdash; ACL and ligament rehab, tennis elbow, and return-to-sport programs</li>
<li><strong>Knee and joint pain</strong> &mdash; including physiotherapy that can help you avoid or delay surgery</li>
<li><strong>Post-surgery rehabilitation</strong> &mdash; structured recovery after knee/hip replacement, fracture or ligament surgery</li>
<li><strong>Pediatric physiotherapy</strong> &mdash; our Child Development Center supports children with developmental delay, cerebral palsy, autism and more</li>
<li><strong>Senior citizen physiotherapy</strong> &mdash; gentle, effective programs for older adults, with home visits available</li>
</ul>
<h3>Why do patients across Bopal choose Dr Physio?</h3>
<ul>
<li><strong>Experienced doctors.</strong> Dr Jeetendra Brahmbhatt brings 13+ years of physiotherapy experience, with specialist expertise in ortho and sports injury rehabilitation.</li>
<li><strong>Complete care under one roof.</strong> Physiotherapy, a medical fitness studio, and a dedicated child development center &mdash; so your whole family's recovery and fitness needs are covered in one place.</li>
<li><strong>Trusted by your neighbours.</strong> With 590+ five-star Google reviews, we're one of the highest-rated physiotherapy clinics in Ahmedabad &mdash; and most of our patients come from Bopal, South Bopal and the surrounding areas.</li>
<li><strong>Easy to reach.</strong> We're centrally located in Bopal, above Sankalp Restaurant, with convenient timings and home-visit options for those who can't travel.</li>
</ul>
<h3>How do I book a physiotherapy appointment in Bopal?</h3>
<p>Booking is simple &mdash; book online through our website or call us at <strong>+91 7874837101</strong>. Same-day and home-visit appointments are often available.</p>
`;

  const { error } = await supabase
    .from('updates')
    .update({ 
      title: "Best Physiotherapy in Bopal — Dr Physio Clinic",
      seo_title: "Best Physiotherapy in Bopal, Ahmedabad | Dr Physio",
      seo_description: "Expert physiotherapy in Bopal — sports injury, ortho & pediatric care by Dr Jeetendra Brahmbhatt. 590+ five-star reviews. Book your visit today.",
      content: bodyHtml,
      is_published: true
    })
    .eq('id', id);
    
  if (error) {
    console.error(`Failed to update:`, error);
  } else {
    console.log("Successfully updated and republished best-physiotherapy-in-bopal");
  }
}

main();
