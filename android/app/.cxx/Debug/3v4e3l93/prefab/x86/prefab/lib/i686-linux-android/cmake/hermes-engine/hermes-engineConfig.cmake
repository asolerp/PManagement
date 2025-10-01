if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/alberto/.gradle/caches/8.10.2/transforms/e1a082e05c1faf04133bfdf14f95cec7/transformed/jetified-hermes-android-0.76.9-debug/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/alberto/.gradle/caches/8.10.2/transforms/e1a082e05c1faf04133bfdf14f95cec7/transformed/jetified-hermes-android-0.76.9-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

