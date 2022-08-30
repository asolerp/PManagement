import React from 'react';
import {View} from 'react-native';
import FastImage from 'react-native-fast-image';

import theme from '../../Theme/Theme';

const CELL_WIDTH = 120;
const JOB_HEIGHT = 25;

const ROW_HEIGHT = 60;

const cellStyle = [
  theme.p2,
  theme.bgGray100,
  theme.borderR0_5,
  theme.itemsCenter,
  theme.justifyCenter,
  theme.borderGray200,
];

export const Row = ({house, jobs}) => {
  console.log('Jobs', jobs);

  const generateHeight = () => {
    if (!jobs) {
      return ROW_HEIGHT;
    }
    return (JOB_HEIGHT + 20) * Object.keys(jobs).length;
  };

  return (
    <View
      style={[
        theme.wFull,
        theme.flexRow,
        theme.borderT0_5,
        theme.borderGray200,
        {height: generateHeight()},
      ]}>
      <View
        style={[
          theme.absolute,
          theme.justifyAround,
          theme.wFull,
          {height: generateHeight()},
          theme.z50,
        ]}>
        {jobs?.map(() => (
          <View
            style={[
              theme.bgInfo,
              theme.roundedSm,
              {height: JOB_HEIGHT, width: CELL_WIDTH * 1.5},
              {marginLeft: CELL_WIDTH * 2.5},
            ]}
          />
        ))}
      </View>

      {/* <View
        style={[
          theme.z50,
          theme.bgInfo,
          theme.absolute,
          theme.roundedSm,
          {height: 25, width: CELL_WIDTH * 3.5},
          {left: CELL_WIDTH * 2.5, top: CELL_HEIGHT / 2 - 25 / 2},
        ]}
      /> */}
      <View style={[{width: CELL_WIDTH, height: generateHeight()}]}>
        <FastImage
          style={[
            theme.wFull,
            theme.hFull,
            theme.borderR0_5,
            theme.borderGray200,
          ]}
          source={{
            uri: house?.houseImage?.original,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
      <View
        style={[...cellStyle, {width: CELL_WIDTH, height: generateHeight()}]}
      />
      <View
        style={[...cellStyle, {width: CELL_WIDTH, height: generateHeight()}]}
      />
      <View
        style={[...cellStyle, {width: CELL_WIDTH, height: generateHeight()}]}
      />
      <View
        style={[...cellStyle, {width: CELL_WIDTH, height: generateHeight()}]}
      />
      <View
        style={[...cellStyle, {width: CELL_WIDTH, height: generateHeight()}]}
      />
      <View
        style={[...cellStyle, {width: CELL_WIDTH, height: generateHeight()}]}
      />
      <View
        style={[...cellStyle, {width: CELL_WIDTH, height: generateHeight()}]}
      />
      <View
        style={[
          ...cellStyle,
          theme.borderR0,
          {width: CELL_WIDTH, height: generateHeight()},
        ]}
      />
    </View>
  );
};
