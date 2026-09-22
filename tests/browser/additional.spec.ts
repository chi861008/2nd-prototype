import {test,expect} from '@playwright/test';
test('upload persistence, removal, payment cancellation, item deletion and clean console',async({page,context})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/control');const display=await context.newPage();display.on('pageerror',e=>errors.push(e.message));await display.goto('/display');
 await page.getByRole('button',{name:'研究情境控制台',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'test-ad.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64')});
 await expect(page.locator('.slide-editor')).toHaveCount(4);
 await page.reload();await page.getByRole('button',{name:'研究情境控制台',exact:true}).click();await expect(page.locator('.slide-editor')).toHaveCount(4);
 await page.locator('.slide-editor').last().getByRole('button',{name:'移除'}).click();await expect(page.locator('.slide-editor')).toHaveCount(3);
 await display.screenshot({path:'test-results/idle.png'});
 await page.locator('.scenarios button').nth(11).click();await page.getByRole('button',{name:'暫停倒數',exact:true}).click();await expect(display.getByRole('heading',{name:'付款完成'})).toBeVisible();
 for(const [width,height] of [[1366,768],[1920,1080],[1194,834]]){await display.setViewportSize({width,height});await display.screenshot({path:'test-results/completed-'+width+'.png'});expect(await display.locator('.completed-card').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;})).toBe(true);}
 await page.locator('.scenarios button').nth(9).click();await page.getByRole('button',{name:'POS 模擬操作',exact:true}).click();
 await page.getByRole('button',{name:'取消此筆',exact:true}).click();await expect(display.locator('.payment-list>div')).toHaveCount(0);
 await page.getByRole('button',{name:'取消付款，回到點餐',exact:true}).click();await expect(display.getByRole('heading',{name:'確認你的好茶'})).toBeVisible();
 await page.getByRole('button',{name:'刪除',exact:true}).first().click();await expect(display.locator('.order-line')).toHaveCount(1);
 await page.getByRole('button',{name:'清空',exact:true}).click();await expect(display.locator('.order-line')).toHaveCount(0);
 await page.goto('/preview');await page.getByRole('button',{name:'研究情境控制台',exact:true}).click();await page.locator('.scenarios button').nth(4).click();await page.getByRole('button',{name:'POS 模擬操作',exact:true}).click();
 await page.screenshot({path:'test-results/preview.png'});
 expect(errors).toEqual([]);
});
