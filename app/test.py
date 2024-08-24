from random import random
import folium
import streamlit as st
from streamlit_folium import st_folium


def create_marker():
    random_lat = random() * 0.5 + 37.79
    random_lon = random() * 0.5 - 122.4

    return folium.Marker(
        location=[random_lat, random_lon],
        popup=f"Random marker at {random_lat:.2f}, {random_lon:.2f}",
    )


@st.fragment(run_every=10.0)
def draw_map(container):
    m = folium.Map(location=[37.95, -122.200], zoom_start=9)
    fg = folium.FeatureGroup(name="Markers")

    for marker in st.session_state["markers"]:
        fg.add_child(marker)

    with container:
        st_folium(
            m,
            feature_group_to_add=fg,
            key="user-map",
            returned_objects=[],
            use_container_width=True,
            height=300,
        )


def add_random_marker():
    st.session_state["markers"].append(create_marker())


def main():
    st.set_page_config(layout="wide")

    if "markers" not in st.session_state:
        st.session_state["markers"] = []

    st.header("Refreshing map", divider="rainbow")
    left_column, right_column = st.columns([1, 2])

    with left_column:
        if st.toggle("Start adding markers automatically"):
            st.fragment(add_random_marker, run_every=1.0)()

    with right_column:
        placeholder = st.empty()

    draw_map(placeholder)


if __name__ == "__main__":
    main()