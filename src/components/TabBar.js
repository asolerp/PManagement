import React, {useState, createRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import Tab from './TabBarReanimated/Tab';

const TabBar = ({tabs, children}) => {
  const [tabPosition, setTabPosition] = useState(0);
  const [tabWidth, setTabWidth] = useState(0);
  const [tabsPositions, setTabsPositions] = useState([]);

  const transRef = createRef();

  const handleTab = (index) => {
    setTabPosition(index);
  };

  return (
    <View style={{flex: 1}}>
      <View
        ref={transRef}
        // transition={transition}
        onLayout={(e) => setTabWidth(e.nativeEvent.layout.width)}
        style={styles.container}>
        <View style={styles.tabWrapper}>
          <View
            style={{
              ...styles.dot,
              ...{
                left:
                  tabsPositions.length > 0 &&
                  tabsPositions[tabPosition]?.x +
                    (tabsPositions[tabPosition]?.width / 2 - 5),
              },
            }}
          />
          {tabs.map((tab, i) => (
            <Tab
              onLayout={(e) =>
                setTabsPositions([...tabsPositions, e.nativeEvent.layout])
              }
              title={tab}
              handleTab={handleTab}
              index={i}
            />
          ))}
        </View>
      </View>
      <View style={styles.screen}>{children[tabPosition]}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '50%',
    // paddingHorizontal: 30,
  },
  tabWrapper: {
    flex: 1,
    flexDirection: 'row',
    // paddingHorizontal: 30,
  },

  dot: {
    height: 10,
    width: 10,
    backgroundColor: '#2A7BA5',
    borderRadius: 100,
    position: 'absolute',
    bottom: 0,
  },
  screen: {
    flex: 15,
  },
});

export default TabBar;
