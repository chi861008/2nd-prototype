import {test,expect} from '@playwright/test';
test('actual POS flow, sync, reload, identity, cash change and next order',async({page,context})=>{
 await page.goto('/control');const display=await context.newPage();await display.goto('/display');
 await page.getByRole('button',{name:'開始新訂單',exact:true}).click();
 await page.getByRole('button',{name:/招牌紅茶拿鐵 NT/}).click();
 await expect(display.locator('.line-main')).toContainText('招牌紅茶拿鐵');
 await expect(display.locator('.grand-total')).toContainText('70');
 await page.getByLabel('使用測試會員').check();await page.getByLabel('發票識別').selectOption('carrier');
 await expect(display.locator('.identity')).toContainText('/AB12CD3');
 await page.getByLabel('發票識別').selectOption('taxId');await expect(display.locator('.identity')).toContainText('12345675');
 await expect(display.locator('.identity')).not.toContainText('/AB12CD3');await expect(display.locator('.identity')).toContainText('林小姐');
 await display.reload();await expect(display.locator('.grand-total')).toContainText('70');
 await page.getByRole('button',{name:'確認訂單，進入付款'}).click();
 await page.getByRole('combobox',{name:'付款方式',exact:true}).selectOption('行動支付');await page.getByLabel('收款金額').fill('50');await page.getByRole('button',{name:'加入付款',exact:true}).click();
 await expect(display.locator('.payment-metrics')).toContainText('NT$20');
 await page.getByRole('combobox',{name:'付款方式',exact:true}).selectOption('現金');await page.getByLabel('收款金額').fill('100');await page.getByRole('button',{name:'加入付款',exact:true}).click();
 await expect(display.locator('.change-row')).toContainText('NT$80');
 await page.getByRole('button',{name:'完成付款',exact:true}).click();await expect(display.getByRole('heading',{name:'付款完成'})).toBeVisible();
 await page.getByRole('button',{name:'開始新訂單',exact:true}).click();await page.waitForTimeout(5200);await expect(display.getByRole('heading',{name:'確認你的好茶'})).toBeVisible();
});
test('13 scenarios, auto scroll, three landscape sizes and screenshots',async({page,context})=>{
 await page.goto('/control');await page.getByRole('button',{name:'研究情境控制台',exact:true}).click();
 const display=await context.newPage();await display.goto('/display');
 for(let i=0;i<13;i++){
 await page.locator('.scenarios button').nth(i).click();
 if(i===0)await expect(display.locator('.customer')).toHaveClass(/idle/);
 else if(i>=11)await expect(display.locator('.customer')).toHaveClass(/completion/);
 else await expect(display.locator('.transaction-head')).toContainText(i>=9?'付款中':'點餐中');
 if(i===2){await expect(display.locator('.order-line')).toHaveCount(18);await expect.poll(()=>display.locator('.order-list').evaluate(e=>e.scrollTop)).toBeGreaterThan(0);}
 if(i===7){await expect(display.locator('.summary-facts')).toContainText('NT$40');await expect(display.locator('.order-discount')).toContainText('NT$30');}
 if(i===10)await expect(display.locator('.change-row')).toContainText('NT$20');
 if(i===12){await expect(display.getByRole('heading',{name:'確認你的好茶'})).toBeVisible();await display.waitForTimeout(3000);await expect(display.locator('.customer')).not.toHaveClass(/idle/);}
 }
 for(const [w,h] of [[1366,768],[1920,1080],[1194,834]]){
 await display.setViewportSize({width:w,height:h});
 for(const i of [1,2,3,4,5,7,8,9,10]){
 await page.locator('.scenarios button').nth(i).click();await display.waitForTimeout(800);
 const problems=await display.evaluate(()=>{const total=document.querySelector('.grand-total')!.getBoundingClientRect();const list=document.querySelector('.order-list')?.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,total:total.bottom>innerHeight||total.right>innerWidth,list:list?list.bottom>total.top:false};});
 expect(problems).toEqual({overflow:false,total:false,list:false});
 if(i===2)expect(await display.locator('.order-line').last().evaluate(e=>e.getBoundingClientRect().bottom <= e.parentElement!.getBoundingClientRect().bottom+1)).toBe(true);
 await display.screenshot({path:'test-results/viewport-'+w+'-'+i+'.png'});
 }
 }
});
test('countdown pause resume and normal expiry',async({page,context})=>{
 await page.goto('/control');await page.getByRole('button',{name:'研究情境控制台',exact:true}).click();
 const display=await context.newPage();await display.goto('/display');
 await page.locator('.scenarios button').nth(11).click();await page.getByRole('button',{name:'暫停倒數',exact:true}).click();
 await display.waitForTimeout(5500);await expect(display.getByRole('heading',{name:'付款完成'})).toBeVisible();
 await page.getByRole('button',{name:'繼續倒數',exact:true}).click();await expect(display.locator('.customer')).toHaveClass(/idle/,{timeout:7000});
});
test('preview, line edits, order discount, gift and marketing configuration',async({page})=>{
 await page.goto('/preview');await expect(page.frameLocator('iframe').locator('.customer')).toBeVisible();
 await page.getByRole('button',{name:'開始新訂單',exact:true}).click();await page.getByRole('button',{name:/超值雙人分享套餐 NT/}).click();
 await page.getByRole('button',{name:'編輯',exact:true}).click();await page.getByLabel('數量',{exact:true}).fill('2');await page.getByLabel('珍珠 +10').first().check();await page.getByLabel('商品備註').first().fill('鮮奶分開裝');
 await page.getByLabel('套餐備註',{exact:true}).fill('整組分開裝');
 await expect(page.frameLocator('iframe').locator('.note')).toContainText(['鮮奶分開裝','整組分開裝']);
 await page.getByLabel('單品折扣（整列金額）').fill('30');await page.getByLabel('整單折扣（NT$）').fill('20');
 await expect(page.frameLocator('iframe').locator('.grand-total')).toContainText('610');await expect(page.frameLocator('iframe').locator('.combo-child')).toContainText(['鮮奶分開裝','原味雞蛋糕']);
 await page.getByLabel('招待此品項（實付 0）').check();await expect(page.frameLocator('iframe').locator('.grand-total')).toContainText('0');
 await page.getByRole('button',{name:'研究情境控制台',exact:true}).click();await page.locator('.slide-editor input').first().fill('1');
 await page.locator('.slide-editor').nth(1).getByRole('button',{name:'上移'}).click();await expect(page.locator('.slide-editor').first()).toContainText('茶香與奶香');
});
test('storage event fallback synchronizes without BroadcastChannel',async({browser})=>{
 const context=await browser.newContext();await context.addInitScript(()=>{Object.defineProperty(window,'BroadcastChannel',{value:undefined,configurable:true});});
 const control=await context.newPage();const display=await context.newPage();await control.goto('/control');await display.goto('/display');
 await control.getByRole('button',{name:'開始新訂單',exact:true}).click();await control.getByRole('button',{name:/春摘四季青茶 NT/}).click();await expect(display.locator('.grand-total')).toContainText('40');await context.close();
});
