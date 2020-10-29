import db from 'mssql-async/db'

export async function ensureAnthemIsEncoded () {
  return await db.execute(`
DECLARE @departmentID uniqueidentifier
DECLARE @mediaWorkflowId uniqueidentifier
DECLARE @domain varchar(max)
DECLARE @httpPath varchar(max)
DECLARE @password varchar(max)
DECLARE @uploadPath varchar(max)
DECLARE @uploadSizeLimit varchar(max)
DECLARE @userName varchar(max)

DECLARE id_cursor CURSOR FOR
  SELECT DISTINCT anthemworkflow.departmentID
  FROM VideoSources anthemworkflow
  INNER JOIN VideoSources defaultworkflow ON anthemworkflow.departmentID=defaultworkflow.departmentID
  INNER JOIN VideoSourceProperties pointedat ON anthemworkflow.videoSourceID = pointedat.videoSourceID
  INNER JOIN VideoSourceProperties defaultproperty ON defaultworkflow.videoSourceID=defaultproperty.videoSourceID
  WHERE anthemworkflow.isDeleted=0
  AND anthemworkflow.videoSourceTypeID IN (9,17)
  AND defaultworkflow.isDeleted=0
  AND defaultworkflow.videoSourceTypeID=1
  AND defaultproperty.propertyName='defaultPath'
  AND defaultproperty.propertyValue='True'
  AND pointedat.propertyName='mediaWorkflowId'
  AND defaultworkflow.videoSourceID != pointedat.propertyValue
OPEN id_cursor
FETCH NEXT FROM id_cursor INTO @departmentID

WHILE @@FETCH_STATUS = 0
BEGIN
  IF EXISTS(SELECT 1
    FROM VideoSourceProperties vsp (NOLOCK)
    INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
    WHERE vsp.propertyName = 'defaultPath' and vsp.propertyValue = 'True' AND vs.departmentID = @departmentID AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1)
  BEGIN
    /* Getting values that we will use for UPDATE below */

    SET @mediaWorkflowId = (SELECT TOP 1 vsp.videoSourceID
      FROM VideoSourceProperties vsp (NOLOCK) INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
      WHERE vs.departmentID = @departmentID AND vsp.propertyName = 'defaultPath' AND vsp.propertyValue = 'True'
      AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1);

    SET @domain = (SELECT TOP 1 vsp.propertyValue
      FROM VideoSourceProperties vsp (NOLOCK) INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
      WHERE vs.departmentID = @departmentID AND vsp.propertyName = 'domain' AND vsp.videoSourceID = @mediaWorkflowId
      AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1);

    SET @httpPath = (SELECT TOP 1 vsp.propertyValue
      FROM VideoSourceProperties vsp (NOLOCK) INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
      WHERE vs.departmentID = @departmentID AND vsp.propertyName = 'httpPath' AND vsp.videoSourceID = @mediaWorkflowId
      AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1);

    SET @password = (SELECT TOP 1 vsp.propertyValue
      FROM VideoSourceProperties vsp (NOLOCK) INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
      WHERE vs.departmentID = @departmentID AND vsp.propertyName = 'password' AND vsp.videoSourceID = @mediaWorkflowId
      AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1);

    SET @uploadPath = (SELECT TOP 1 vsp.propertyValue
      FROM VideoSourceProperties vsp (NOLOCK) INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
      WHERE vs.departmentID = @departmentID AND vsp.propertyName = 'uploadPath' AND vsp.videoSourceID = @mediaWorkflowId
      AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1);

    SET @uploadSizeLimit = (SELECT TOP 1 vsp.propertyValue
      FROM VideoSourceProperties vsp (NOLOCK) INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
      WHERE vs.departmentID = @departmentID AND vsp.propertyName = 'uploadSizeLimit' AND vsp.videoSourceID = @mediaWorkflowId
      AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1);

    SET @userName = (SELECT TOP 1 vsp.propertyValue
      FROM VideoSourceProperties vsp (NOLOCK) INNER JOIN VideoSources vs ON vs.videoSourceID = vsp.videoSourceID
      WHERE vs.departmentID = @departmentID AND vsp.propertyName = 'userName' AND vsp.videoSourceID = @mediaWorkflowId
      AND vs.isDeleted = 0 AND vs.videoSourceTypeID = 1);

    /* UPDATE goes from here */
    UPDATE VSP
      SET propertyValue = @mediaWorkflowId
      FROM VideoSourceProperties VSP INNER JOIN VideoSources vs ON vs.videoSourceID = VSP.videoSourceID
      WHERE VSP.propertyName = 'mediaWorkflowId' and VSP.videoSourceTypeID IN (9, 17) AND vs.departmentID = @departmentID

    -- update domain
    UPDATE VSP
      SET propertyValue = @domain
      FROM VideoSourceProperties VSP INNER JOIN VideoSources vs ON vs.videoSourceID = VSP.videoSourceID
      WHERE VSP.propertyName = 'domain' and VSP.videoSourceTypeID IN (9, 17) AND vs.departmentID = @departmentID

    -- update httpPath
    UPDATE VSP
      SET propertyValue = @httpPath
      FROM VideoSourceProperties VSP INNER JOIN VideoSources vs ON vs.videoSourceID = VSP.videoSourceID
      WHERE VSP.propertyName = 'httpPath' and VSP.videoSourceTypeID IN (9, 17) AND vs.departmentID = @departmentID

    -- update password
    UPDATE VSP
      SET propertyValue = @password
      FROM VideoSourceProperties VSP INNER JOIN VideoSources vs ON vs.videoSourceID = VSP.videoSourceID
      WHERE VSP.propertyName = 'password' and VSP.videoSourceTypeID IN (9, 17) AND vs.departmentID = @departmentID

    -- update uploadPath
    UPDATE VSP
      SET propertyValue = @uploadPath
      FROM VideoSourceProperties VSP INNER JOIN VideoSources vs ON vs.videoSourceID = VSP.videoSourceID
      WHERE VSP.propertyName = 'uploadPath' and VSP.videoSourceTypeID IN (9, 17) AND vs.departmentID = @departmentID

    -- update uploadSizeLimit
    UPDATE VSP
      SET propertyValue = @uploadSizeLimit
      FROM VideoSourceProperties VSP INNER JOIN VideoSources vs ON vs.videoSourceID = VSP.videoSourceID
      WHERE VSP.propertyName = 'uploadSizeLimit' and VSP.videoSourceTypeID IN (9, 17) AND vs.departmentID = @departmentID

    -- update userName
    UPDATE VSP
      SET propertyValue = @userName
      FROM VideoSourceProperties VSP INNER JOIN VideoSources vs ON vs.videoSourceID = VSP.videoSourceID
      WHERE VSP.propertyName = 'userName' and VSP.videoSourceTypeID IN (9, 17) AND vs.departmentID = @departmentID
    END
  FETCH NEXT FROM id_cursor INTO @departmentID
  END
CLOSE id_cursor
DEALLOCATE id_cursor
  `)
}
