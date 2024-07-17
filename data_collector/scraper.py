import asyncio
from bs4 import BeautifulSoup
import httpx

from data_collector.utils import to_df


async def scrape():
    timeout = httpx.Timeout(5, read=10)
    params = dict()
    async with httpx.AsyncClient(timeout=timeout) as client:
        num_pages = 1171
        for i in range(num_pages):
            try:
                if i % 3 == 0:
                    print(f"{(i//3)+1}-th interval")
                    await asyncio.sleep(3)
                params['page'] = i
                r = await client.get("https://www.rumah123.com/jual/bandung/tanah/", params=params)
                soup = BeautifulSoup(r.text, "html.parser")
                divs = soup.find_all('div', class_='card-featured__middle-section')
                df = to_df(divs)
                df.to_csv('csv/house_price_raw.csv', mode='a', index=False, header=False)
            except:
                print(f"Failed at index: {i}")
                break


if __name__ == "__main__":
    asyncio.run(scrape())