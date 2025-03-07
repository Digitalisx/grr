import {ApiFlow, ApiFlowDescriptor, ApiFlowResult, ApiFlowState, ApiGrrBinary, ApiScheduledFlow, ArtifactCollectorFlowArgs, ArtifactCollectorFlowProgress as ApiArtifactCollectorFlowProgress, ByteString, ExecuteBinaryResponse as ApiExecuteBinaryResponse, ExecuteResponse as ApiExecuteResponse, Hash, PathSpec as ApiPathSpec, PathSpecPathType, StatEntry as ApiStatEntry} from '../api/api_interfaces';
import {ArtifactCollectorFlowProgress, ArtifactProgress, Binary, BinaryType, ExecuteBinaryResponse, ExecuteResponse, Flow, FlowDescriptor, FlowResult, FlowResultCount, FlowState, HexHash, OperatingSystem, RegistryKey, RegistryValue, ScheduledFlow} from '../models/flow';
import {PathSpec, PathSpecSegment, StatEntry} from '../models/vfs';
import {assertEnum, assertKeyNonNull, assertKeyTruthy, assertNonNull, isNonNull, isNull, PreconditionError} from '../preconditions';

import {bytesToHex, createDate, createOptionalBigInt, createOptionalDateSeconds, createUnknownObject, decodeBase64} from './primitive';

/** Constructs a FlowDescriptor from the corresponding API data structure */
export function translateFlowDescriptor(fd: ApiFlowDescriptor): FlowDescriptor {
  assertKeyNonNull(fd, 'name');
  assertKeyNonNull(fd, 'category');
  assertKeyNonNull(fd, 'defaultArgs');

  const result = {
    name: fd.name,
    friendlyName: fd.friendlyName || fd.name,
    category: fd.category,
    defaultArgs: {...fd.defaultArgs},
  };
  // The protobuf type URL is an implementation detail of the API, thus we
  // remove if from defaultArgs.
  delete result.defaultArgs['@type'];
  return result;
}

function translateApiFlowState(state: ApiFlowState): FlowState {
  if (state === ApiFlowState.RUNNING) {
    return FlowState.RUNNING;
  } else if (state === ApiFlowState.ERROR) {
    return FlowState.ERROR;
  } else {
    return FlowState.FINISHED;
  }
}

/** Constructs a Flow from the corresponding API data structure. */
export function translateFlow(apiFlow: ApiFlow): Flow {
  assertKeyNonNull(apiFlow, 'flowId');
  assertKeyNonNull(apiFlow, 'clientId');
  assertKeyNonNull(apiFlow, 'lastActiveAt');
  assertKeyNonNull(apiFlow, 'startedAt');
  assertKeyNonNull(apiFlow, 'name');
  assertKeyNonNull(apiFlow, 'state');

  let resultCounts: ReadonlyArray<FlowResultCount>|undefined;

  // For legacy flows where isMetadataSet is unset, we need to be careful to
  // differentiate between a flow that has no numResultsPerTypeTag because it
  // has 0 results and a flow that has results but has numResultsPerTypeTag
  // unset because it was executed before we added this field. Thus, only set
  // resultCounts if it contains results OR we are sure that missing
  // numResultsPerTypeTag really means the flow has 0 results.
  if (apiFlow.resultMetadata?.isMetadataSet ||
      apiFlow.resultMetadata?.numResultsPerTypeTag?.length) {
    resultCounts =
        (apiFlow.resultMetadata.numResultsPerTypeTag ?? []).map(rc => {
          assertKeyNonNull(rc, 'type');
          return {
            type: rc.type,
            tag: rc.tag,
            count: Number(rc.count),
          };
        });
  }

  return {
    flowId: apiFlow.flowId,
    clientId: apiFlow.clientId,
    lastActiveAt: createDate(apiFlow.lastActiveAt),
    startedAt: createDate(apiFlow.startedAt),
    name: apiFlow.name,
    creator: apiFlow.creator || 'unknown',
    args: createUnknownObject(apiFlow.args),
    progress: createUnknownObject(apiFlow.progress),
    state: translateApiFlowState(apiFlow.state),
    errorDescription: apiFlow.errorDescription ?? undefined,
    resultCounts,
  };
}

/** Construct a FlowResult model object, corresponding to ApiFlowResult.  */
export function translateFlowResult(apiFlowResult: ApiFlowResult): FlowResult {
  assertKeyNonNull(apiFlowResult, 'payload');
  assertKeyNonNull(apiFlowResult, 'payloadType');
  assertKeyNonNull(apiFlowResult, 'timestamp');

  return {
    payload: createUnknownObject(apiFlowResult.payload),
    payloadType: apiFlowResult.payloadType,
    tag: apiFlowResult.tag ?? '',
    timestamp: createDate(apiFlowResult.timestamp),
  };
}

/** Constructs a ScheduledFlow from the corresponding API data structure. */
export function translateScheduledFlow(apiSF: ApiScheduledFlow): ScheduledFlow {
  assertKeyNonNull(apiSF, 'scheduledFlowId');
  assertKeyNonNull(apiSF, 'clientId');
  assertKeyNonNull(apiSF, 'creator');
  assertKeyNonNull(apiSF, 'flowName');
  assertKeyNonNull(apiSF, 'flowArgs');
  assertKeyNonNull(apiSF, 'createTime');

  return {
    scheduledFlowId: apiSF.scheduledFlowId,
    clientId: apiSF.clientId,
    creator: apiSF.creator,
    flowName: apiSF.flowName,
    flowArgs: createUnknownObject(apiSF.flowArgs),
    createTime: createDate(apiSF.createTime),
    error: apiSF.error,
  };
}

function byteStringToHex(byteString?: ByteString): string|undefined {
  if (byteString === undefined) {
    return undefined;
  }
  return bytesToHex(decodeBase64(byteString)).toLowerCase();
}

/** Translates base64-encoded hashes to hex-encoding. */
export function translateHashToHex(hash: Hash): HexHash {
  return {
    sha256: byteStringToHex(hash.sha256),
    sha1: byteStringToHex(hash.sha1),
    md5: byteStringToHex(hash.md5),
  };
}

function translateOperatingSystem(str: string): OperatingSystem {
  if (!Object.values(OperatingSystem).includes(str as OperatingSystem)) {
    throw new PreconditionError(
        `OperatingSystem enum does not include "${str}".`);
  }
  return str as OperatingSystem;
}

/** Translates a String to OperatingSystem, returning undefined on error. */
export function safeTranslateOperatingSystem(str: string|undefined|
                                             null): OperatingSystem|null {
  if (isNull(str)) {
    return null;
  }

  try {
    return translateOperatingSystem(str);
  } catch (e: unknown) {
    return null;
  }
}

/** Constructs an ExecuteResponse from the corresponding API data structure. */
export function translateExecuteResponse(er: ApiExecuteResponse):
    ExecuteResponse {
  assertKeyNonNull(er, 'request');

  return {
    request: {
      cmd: er.request.cmd ?? '',
      args: er.request.args ?? [],
      timeLimitSeconds: er.request.timeLimit ?? 0,
    },
    exitStatus: er.exitStatus ?? -1,
    stdout: atob(er.stdout ?? ''),
    stderr: atob(er.stderr ?? ''),
    timeUsedSeconds: (er.timeUsed ?? 0) / 1e6
  };
}

/**
 * Constructs an ExecuteBinaryResponse from the corresponding API data
 * structure.
 */
export function translateExecuteBinaryResponse(er: ApiExecuteBinaryResponse):
    ExecuteBinaryResponse {
  return {
    exitStatus: er.exitStatus ?? -1,
    stdout: atob(er.stdout ?? ''),
    stderr: atob(er.stderr ?? ''),
    timeUsedSeconds: (er.timeUsed ?? 0) / 1e6
  };
}

/**
 * Constructs internal ArtifactCollectorFlowProgress from an ArtifactCollector.
 */
export function translateArtifactCollectorFlowProgress(flow: Flow):
    ArtifactCollectorFlowProgress {
  const progressAritfacts =
      (flow.progress as ApiArtifactCollectorFlowProgress)?.artifacts ?? [];

  const argumentArtifacts =
      (flow.args as ArtifactCollectorFlowArgs)?.artifactList ?? [];

  const artifacts = new Map<string, ArtifactProgress>();

  for (const name of argumentArtifacts) {
    artifacts.set(name, {name, numResults: undefined});
  }

  for (const art of progressAritfacts) {
    assertNonNull(art.name, 'ArtifactProgress.name');
    artifacts.set(art.name, {name: art.name, numResults: art.numResults ?? 0});
  }

  return {artifacts};
}

/** Parses an API PathSpec. */
export function translatePathSpec(ps: ApiPathSpec): PathSpec {
  assertEnum(ps.pathtype, PathSpecPathType);

  const pathspec = {
    path: '',
    pathtype: ps.pathtype,
    segments: [] as PathSpecSegment[],
  };
  let currentPathSpec: ApiPathSpec|undefined = ps;

  while (currentPathSpec) {
    assertEnum(currentPathSpec.pathtype, PathSpecPathType);
    assertKeyNonNull(currentPathSpec, 'path');

    pathspec.path += currentPathSpec.path;
    pathspec.pathtype = currentPathSpec.pathtype;
    pathspec.segments.push({
      path: currentPathSpec.path,
      pathtype: currentPathSpec.pathtype,
    });

    currentPathSpec = currentPathSpec.nestedPath;
  }

  return pathspec;
}

/**
 * Parses a StatEntry to a RegistryKey/Value if possible. As fallback, returns
 * the original StatEntry.
 */
export function translateVfsStatEntry(statEntry: ApiStatEntry): StatEntry|
    RegistryKey|RegistryValue {
  assertKeyNonNull(statEntry, 'pathspec');
  assertKeyNonNull(statEntry.pathspec, 'path');

  const path = statEntry.pathspec.path;

  if (statEntry.registryType) {
    return {
      path,
      type: statEntry.registryType,
      size: BigInt(statEntry.stSize ?? 0),
    };
  }

  if (statEntry.pathspec.pathtype === PathSpecPathType.REGISTRY) {
    return {
      path,
      type: 'REG_KEY',
    };
  }

  return translateStatEntry(statEntry);
}

/** Parses a StatEntry. */
export function translateStatEntry(statEntry: ApiStatEntry): StatEntry {
  assertKeyNonNull(statEntry, 'pathspec');

  return {
    stMode: createOptionalBigInt(statEntry.stMode),
    stIno: createOptionalBigInt(statEntry.stIno),
    stDev: createOptionalBigInt(statEntry.stDev),
    stNlink: createOptionalBigInt(statEntry.stNlink),
    stUid: statEntry.stUid,
    stGid: statEntry.stGid,
    stSize: createOptionalBigInt(statEntry.stSize),
    stAtime: createOptionalDateSeconds(statEntry.stAtime),
    stMtime: createOptionalDateSeconds(statEntry.stMtime),
    stCtime: createOptionalDateSeconds(statEntry.stCtime),
    stBtime: createOptionalDateSeconds(statEntry.stBtime),
    stBlocks: createOptionalBigInt(statEntry.stBlocks),
    stBlksize: createOptionalBigInt(statEntry.stBlksize),
    stRdev: createOptionalBigInt(statEntry.stRdev),
    stFlagsOsx: statEntry.stFlagsOsx,
    stFlagsLinux: statEntry.stFlagsLinux,
    symlink: statEntry.symlink,
    pathspec: translatePathSpec(statEntry.pathspec),
  };
}


/**
 * Returns true if the returned value of translateVfsStatEntry() is a StatEntry.
 */
export function isStatEntry(entry: StatEntry|RegistryKey|
                            RegistryValue): entry is StatEntry {
  return isNonNull((entry as StatEntry).pathspec);
}

/**
 * Returns true if the returned value of translateVfsStatEntry() is a Registry
 * key or value.
 */
export function isRegistryEntry(entry: StatEntry|RegistryKey|RegistryValue):
    entry is RegistryKey|RegistryValue {
  return isNonNull((entry as RegistryKey).type);
}

/**
 * Translates an ApiGrrBinary, raising if hasValidSignature is false or legacy
 * types are used.
 */
export function translateBinary(b: ApiGrrBinary): Binary {
  assertKeyNonNull(b, 'path');
  assertKeyNonNull(b, 'size');
  assertKeyNonNull(b, 'type');
  assertKeyNonNull(b, 'timestamp');
  assertEnum(b.type, BinaryType);
  assertKeyTruthy(b, 'hasValidSignature');

  return {
    path: b.path,
    size: BigInt(b.size),
    type: b.type,
    timestamp: createDate(b.timestamp),
  };
}

/**
 * Translates an ApiGrrBinary, returning null if hasValidSignature is false or
 * legacy types are used.
 */
export function safeTranslateBinary(b: ApiGrrBinary): Binary|null {
  try {
    return translateBinary(b);
  } catch (e: unknown) {
    return null;
  }
}
