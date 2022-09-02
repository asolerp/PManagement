import React from 'react';
import {Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {DEFAULT_IMAGE} from '../../constants/general';

import theme from '../../Theme/Theme';
import {
  startXDependingStartHour,
  widthDependingNumberOfHour,
} from './utils/hourChecker';

export const CELL_WIDTH = 125;
const JOB_HEIGHT = theme.h6.height;

const ROW_HEIGHT = 70;

const cellStyle = [
  theme.p2,
  theme.bgGray100,
  theme.borderR0_5,
  theme.itemsCenter,
  theme.justifyCenter,
  theme.borderGray200,
];

export const Row = ({house, jobs}) => {
  const generateHeight = () => {
    if (!jobs) {
      return ROW_HEIGHT;
    }
    if ((JOB_HEIGHT + 30) * Object.keys(jobs).length < ROW_HEIGHT) {
      return ROW_HEIGHT;
    }
    return (JOB_HEIGHT + 30) * Object.keys(jobs).length;
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
        {jobs?.map((job) => {
          const width = widthDependingNumberOfHour(
            job.startHour.toDate(),
            job.endHour.toDate(),
          );
          const marginLeft =
            CELL_WIDTH * startXDependingStartHour(job.startHour.toDate());
          return (
            <View
              key={job.id}
              style={[
                {backgroundColor: `#${job.color}`},
                theme.flexRow,
                theme.roundedSm,
                theme.itemsCenter,
                {
                  height: JOB_HEIGHT,
                  width,
                  marginLeft: marginLeft + 1,
                },
              ]}>
              <FastImage
                style={[
                  theme.w10,
                  theme.h10,
                  theme.roundedFull,
                  theme.borderGray200,
                  theme._mL0_5,
                ]}
                source={{
                  uri: job?.worker?.profileImage?.small || DEFAULT_IMAGE,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={[theme.mL2, theme.fontSansBold, theme.textWhite]}>
                - {job.worker.firstName} {job.worker.secondName}
              </Text>
            </View>
          );
        })}
      </View>
      <View
        style={[
          theme.itemsCenter,
          theme.justifyCenter,
          theme.bgGray100,
          theme.borderR0_5,
          theme.borderGray200,
          {width: CELL_WIDTH, height: generateHeight()},
        ]}>
        <FastImage
          style={[theme.w10, theme.h10, theme.roundedFull]}
          source={{
            uri: house?.houseImage?.original,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[theme.fontSansBold, theme.mT2]}>
          {house.houseName}
        </Text>
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
