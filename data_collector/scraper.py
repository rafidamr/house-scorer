import asyncio
from random import random
from bs4 import BeautifulSoup
import httpx

from data_collector.utils import to_df
from data_collector.user_agents import user_agents


async def scrape():
    timeout = httpx.Timeout(5, read=10)
    # client = httpx.AsyncClient(timeout=timeout)
    # num_pages = 1
    num_pages = 1171
    i = 1
    while i <= num_pages:
        try:
            # if i % 3 == 0:
            print(f"Page {i}")
            await asyncio.sleep(5)
            params = {'page': i}
            headers = {'user-agent': user_agents[int(random()*100)]}
            client = httpx.AsyncClient(timeout=timeout, headers=headers)
            r = await client.get("https://www.rumah123.com/jual/bandung/tanah/", params=params)
            await client.aclose()
            soup = BeautifulSoup(r.text, "html.parser")
            divs = soup.find_all('div', class_='card-featured__middle-section')
            if not divs:
                print(f"Delaying at page: {i}")
                await asyncio.sleep(300)
                continue
            df = to_df(divs)
            df.to_csv('csv/house_price_raw.csv', mode='a', index=False, header=False)
            i += 1
        except:
            print(f"Failed at page: {i}")
            continue


if __name__ == "__main__":
    asyncio.run(scrape())