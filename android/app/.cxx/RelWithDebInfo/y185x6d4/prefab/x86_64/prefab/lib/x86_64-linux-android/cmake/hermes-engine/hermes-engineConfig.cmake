if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/alberto/.gradle/caches/8.10.2/transforms/d5a9fdd7122eba4e850bf64b1735630a/transformed/jetified-hermes-android-0.76.9-release/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/alberto/.gradle/caches/8.10.2/transforms/d5a9fdd7122eba4e850bf64b1735630a/transformed/jetified-hermes-android-0.76.9-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

