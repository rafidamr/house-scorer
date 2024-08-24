import branca
import joblib
import geopandas
import streamlit as st

class VorTess(object):
    """
    This class loads and return a voronoi tesselation object
    as a geopandas.GeoDataFrame
    """
    @st.cache_data
    def __init__(_self) -> None:
        _self.gdf = None
        with open('files/pkl/gpd_greater_bdg.pkl', 'rb') as f:
            _self.gdf = joblib.load(f)
 
        _self.cm = branca.colormap.LinearColormap(
            vmin=_self.gdf['prediction'].quantile(0.0),
            vmax=_self.gdf['prediction'].quantile(1),
            colors=['lightblue', 'yellow', 'orange', 'red', 'darkred', 'maroon', 'black'],
            caption="Price Prediction (Rp.)",
        )

    # @property
    @st.cache_data
    def data(_self) -> geopandas.GeoDataFrame:
        return _self.gdf

    # @property
    @st.cache_data
    def colormap(_self) -> branca.colormap.LinearColormap:
        return _self.cm
