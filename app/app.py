import asyncio
import folium
import streamlit as st

from streamlit_folium import st_folium
from vortess import VorTess


async def main():
    st.set_page_config(layout="wide")

    vortess = VorTess()
    gdf_obj = vortess.data()
    colormap = vortess.colormap()

    tooltip = folium.GeoJsonTooltip(
        fields=["prediction"],
        aliases=["Prediction (Rp.): "],
        localize=True,
        sticky=False,
        labels=True,
        style="""
            background-color: #F0EFEF;
            border: 2px solid black;
            border-radius: 3px;
            box-shadow: 3px;
        """,
        max_width=800,
    )

    st.session_state.run_every = 100
    st.session_state.loop = 0

    @st.fragment(run_every=None)
    def draw():
        st.session_state.loop += 1
        if st.session_state.loop == 10:
            st.session_state.run_every = None
            return

        data = gdf_obj[:st.session_state.loop * 10]
        site_map = folium.Map(location=[-6.9301133,107.6208473],
                            tiles="Cartodb voyager",
                            zoom_start=11,
                            zoom_control=False
                            )
        colormap.add_to(site_map)
        site_map.add_child(folium.GeoJson(
            data,
            style_function=lambda r: {
                "fillColor": colormap(r["properties"]["prediction"]),
                "fillOpacity": 0.35,
                "weight": 0,
            },
            tooltip=tooltip
        ))
        st_folium(site_map, use_container_width=True)

    draw()


if __name__ == "__main__":
    asyncio.run(main())
