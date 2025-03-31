/**
 * Simple Admin Menu Verification Script
 * 
 * This script verifies that the admin menu has been consolidated
 * into the 4 logical groups as specified, by checking for:
 * 1. Dashboard
 * 2. Content Management (merged: Stories, Content, WordPress Sync)
 * 3. User Management (merged: Users, Moderation)
 * 4. Insights & Reports (merged: Analytics, Statistics, Feedback, Bug Reports)
 */

import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

async function verifyAdminMenu() {
  console.log('Checking admin menu consolidation...');
  
  // Launch the browser
  const browser = await puppeteer.launch({
    executablePath: '/nix/store/jlri0xdh2qvyx8h7fm538n8q2kcg5j3z-chromium-120.0.6099.216/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the website
    console.log('Loading application...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    
    // Wait for the page to be loaded
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Save the initial HTML for reference
    const initialHtml = await page.content();
    await fs.writeFile('admin-menu-initial.html', initialHtml);
    
    // Check if there's a login form or user is already logged in
    const isLoggedIn = await page.evaluate(() => {
      // Check for admin-specific elements
      return document.body.innerText.includes('Admin Controls');
    });
    
    if (!isLoggedIn) {
      console.log('Not logged in as admin. Will attempt to login first.');
      
      // Check if login button exists and click it
      const hasLoginButton = await page.evaluate(() => {
        const loginButtons = Array.from(document.querySelectorAll('button')).filter(
          button => button.innerText.toLowerCase().includes('login') || 
                   button.innerText.toLowerCase().includes('sign in')
        );
        
        if (loginButtons.length > 0) {
          loginButtons[0].click();
          return true;
        }
        return false;
      });
      
      if (hasLoginButton) {
        console.log('Clicked on login button, waiting for login form...');
        
        // Wait for login form to appear
        await page.waitForFunction(() => {
          return document.querySelector('input[type="email"]') || 
                 document.querySelector('input[type="text"]');
        }, { timeout: 5000 }).catch(() => {
          console.log('Login form not detected within timeout period.');
        });
        
        // Fill in login credentials
        await page.evaluate(() => {
          // Try to find username/email input
          const emailInput = document.querySelector('input[type="email"]') || 
                             document.querySelector('input[name="email"]') ||
                             document.querySelector('input[placeholder*="email" i]') ||
                             document.querySelector('input[type="text"]');
          
          // Try to find password input
          const passwordInput = document.querySelector('input[type="password"]');
          
          // Fill in credentials if inputs are found
          if (emailInput) emailInput.value = 'admin@example.com';
          if (passwordInput) passwordInput.value = 'password';
          
          // Try to find login/submit button
          const submitButton = Array.from(document.querySelectorAll('button')).find(
            button => button.innerText.toLowerCase().includes('login') || 
                     button.innerText.toLowerCase().includes('sign in') ||
                     button.innerText.toLowerCase().includes('submit')
          );
          
          if (submitButton) submitButton.click();
        });
        
        console.log('Attempted to log in, waiting for page to reload...');
        await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {
          console.log('Navigation timeout - continuing anyway');
        });
      }
    }
    
    // Expand the admin menu if it exists
    const adminMenuExpanded = await page.evaluate(() => {
      // Try to find admin controls section
      const adminControls = Array.from(document.querySelectorAll('button')).find(
        button => button.innerText.includes('Admin Controls')
      );
      
      if (adminControls) {
        // Check if it's already expanded
        const isExpanded = adminControls.getAttribute('data-state') === 'open';
        
        if (!isExpanded) {
          adminControls.click();
          return true;
        }
        return true;
      }
      return false;
    });
    
    if (adminMenuExpanded) {
      console.log('Admin menu found and expanded');
      
      // Wait a bit for the menu to expand fully
      await page.waitForTimeout(500);
      
      // Take a screenshot for visual verification
      await page.screenshot({ path: 'admin-menu-expanded.png' });
      
      // Save the expanded menu HTML
      const expandedHtml = await page.content();
      await fs.writeFile('admin-menu-expanded.html', expandedHtml);
      
      // Check for the consolidated menu items
      const consolidatedItems = await page.evaluate(() => {
        // Define the menu items to look for
        const expectedItems = [
          'Dashboard',
          'Content Management',
          'User Management',
          'Insights & Reports'
        ];
        
        // Find all menu items in the admin section
        const menuTexts = Array.from(document.querySelectorAll('button span'))
          .map(span => span.innerText.trim())
          .filter(text => text.length > 0);
        
        // Check which expected items are found
        return expectedItems.map(item => {
          return {
            item,
            found: menuTexts.includes(item)
          };
        });
      });
      
      // Report the findings
      console.log('\nAdmin Menu Consolidation Check Results:');
      console.log('--------------------------------------');
      
      let foundCount = 0;
      consolidatedItems.forEach(({ item, found }) => {
        console.log(`${item}: ${found ? 'Found ✅' : 'Not found ❌'}`);
        if (found) foundCount++;
      });
      
      const totalItems = consolidatedItems.length;
      const percentage = Math.round((foundCount / totalItems) * 100);
      
      console.log('\nSummary:');
      console.log(`Found ${foundCount} out of ${totalItems} consolidated menu items (${percentage}%)`);
      
      if (percentage === 100) {
        console.log('\n🎉 SUCCESS: Admin menu has been successfully consolidated into 4 logical groups!');
      } else if (percentage >= 75) {
        console.log('\n⚠️ PARTIAL SUCCESS: Most admin menu items have been consolidated, but some may be missing.');
      } else {
        console.log('\n❌ FAILED: Admin menu has not been properly consolidated. Please check implementation.');
      }
      
    } else {
      console.log('Could not find or expand the admin menu. User may not be logged in as admin.');
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyAdminMenu().catch(console.error);