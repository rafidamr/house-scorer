import asyncio
import folium
import lonboard
import streamlit as st

from streamlit_folium import st_folium
from vortess import VorTess


async def main():
    st.set_page_config(layout="wide")

    vortess = VorTess()
    gdf_obj = vortess.data()
    colormap = vortess.colormap()

    data = gdf_obj[:st.session_state.loop * 10]
    lonboard.viz(data)


if __name__ == "__main__":
    asyncio.run(main())
