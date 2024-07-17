import pandas as pd


def get_safe(func):
    def decorator(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except:
            return ''
    return decorator

@get_safe
def get_price(div):
    return div.find('strong').string

@get_safe
def get_location(div):
    return div.find('span', recursive=False).string

@get_safe
def get_size(div):
    return div.find('div', class_='attribute-info').find('span').string

@get_safe
def get_agent(div):
    return div.find('img')['alt']

@get_safe
def get_detail_link(div):
    return div.find('a')['href']

@get_safe
def get_desc(div):
    return div.find('h2').string

def to_df(divs):
    house_dict = dict.fromkeys(['Price', 'Location', 'Size', 'Agent', 'Link', 'Desc'])
    for k in house_dict.keys():
        house_dict[k] = []
    for div in divs:
        house_dict['Price'].append(get_price(div))
        house_dict['Location'].append(get_location(div))
        house_dict['Size'].append(get_size(div))
        house_dict['Agent'].append(get_agent(div))
        house_dict['Link'].append(get_detail_link(div))
        house_dict['Desc'].append(get_desc(div))
    df = pd.DataFrame({ key: pd.Series(value) for key, value in house_dict.items() })
    return df
